/// <reference types="@cloudflare/workers-types" />

import trackData from "./data/tracks.json";
import type { PublicTrack, Track } from "./types";

interface Env {
  MUSIC: R2Bucket;
  ASSETS: Fetcher;
}

const tracks = trackData as Track[];

const securityHeaders = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

export function canonicalUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  if (url.hostname !== "www.the-bom.com") return null;

  url.hostname = "the-bom.com";
  url.protocol = "https:";
  url.port = "";
  return url.toString();
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  Object.entries(securityHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function publicTrack(track: Track): PublicTrack {
  const { objectKey: _objectKey, ...safeTrack } = track;
  return { ...safeTrack, streamUrl: `/media/${encodeURIComponent(track.id)}` };
}

export function findTrack(id: string) {
  return tracks.find((track) => track.id === id);
}

async function streamTrack(request: Request, env: Env, id: string) {
  const track = findTrack(id);
  if (!track) return json({ error: "곡을 찾을 수 없습니다." }, { status: 404 });

  if (request.method === "HEAD") {
    const object = await env.MUSIC.head(track.objectKey);
    if (!object) return json({ error: "R2에 음원이 없습니다." }, { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Content-Type", track.format === "mp3" ? "audio/mpeg" : "audio/wav");
    headers.set("Content-Length", String(object.size));
    headers.set("Accept-Ranges", "bytes");
    headers.set("ETag", object.httpEtag);
    headers.set("Content-Disposition", "inline");
    Object.entries(securityHeaders).forEach(([key, value]) => headers.set(key, value));
    return new Response(null, { headers });
  }

  const object = await env.MUSIC.get(track.objectKey, {
    onlyIf: request.headers,
    range: request.headers
  });

  if (!object) return json({ error: "R2에 음원이 없습니다." }, { status: 404 });
  if (!("body" in object)) return new Response(null, { status: 412 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", track.format === "mp3" ? "audio/mpeg" : "audio/wav");
  headers.set("Accept-Ranges", "bytes");
  headers.set("ETag", object.httpEtag);
  headers.set("Content-Disposition", "inline");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  Object.entries(securityHeaders).forEach(([key, value]) => headers.set(key, value));

  const isRangeRequest = request.headers.has("Range") && object.range;
  if (isRangeRequest) {
    const range = object.range!;
    const isSuffixRange = "suffix" in range && typeof range.suffix === "number";
    const offset = isSuffixRange
      ? Math.max(object.size - range.suffix, 0)
      : ("offset" in range ? (range.offset ?? 0) : 0);
    const length = isSuffixRange
      ? Math.min(range.suffix, object.size)
      : ("length" in range ? (range.length ?? object.size - offset) : object.size - offset);
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("Content-Length", String(length));
  } else {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { status: isRangeRequest ? 206 : 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const canonicalLocation = canonicalUrl(request.url);

    if (canonicalLocation) {
      return Response.redirect(canonicalLocation, 308);
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, tracks: tracks.length });
    }

    if (url.pathname === "/api/tracks") {
      if (request.method !== "GET") {
        return json({ error: "허용되지 않은 요청입니다." }, { status: 405, headers: { Allow: "GET" } });
      }
      return json({ tracks: tracks.map(publicTrack) });
    }

    if (url.pathname.startsWith("/media/")) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ error: "허용되지 않은 요청입니다." }, { status: 405, headers: { Allow: "GET, HEAD" } });
      }
      const id = decodeURIComponent(url.pathname.slice("/media/".length));
      return streamTrack(request, env, id);
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
