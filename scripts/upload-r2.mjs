import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const bucket = process.env.R2_BUCKET ?? "the-bom-music";
const sourceDir = new URL("../the-bom-wav/", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("../src/data/tracks.json", import.meta.url), "utf8")
);
const stateFile = new URL("../.r2-upload-state.json", import.meta.url);
const state = existsSync(stateFile)
  ? JSON.parse(readFileSync(stateFile, "utf8"))
  : { bucket, objects: {} };

if (state.bucket !== bucket) {
  state.bucket = bucket;
  state.objects = {};
}

function runWrangler(args, options = {}) {
  return spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["wrangler", ...args],
    { encoding: "utf8", ...options }
  );
}

function saveState() {
  const temporaryFile = new URL("../.r2-upload-state.json.tmp", import.meta.url);
  writeFileSync(temporaryFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  renameSync(temporaryFile, stateFile);
}

let uploaded = 0;
let skipped = 0;

for (const [index, track] of manifest.entries()) {
  const contentType = track.format === "mp3" ? "audio/mpeg" : "audio/wav";
  const sourcePath = join(sourceDir.pathname, track.filename);
  const sourceStat = statSync(sourcePath);
  const completed = state.objects[track.objectKey];

  if (completed?.size === sourceStat.size && completed.mtimeMs === sourceStat.mtimeMs) {
    skipped += 1;
    console.log(`[${index + 1}/${manifest.length}] Skipping ${track.filename} (previous upload verified)`);
    continue;
  }

  console.log(`[${index + 1}/${manifest.length}] Uploading ${track.filename}`);

  const result = runWrangler(
    [
      "r2",
      "object",
      "put",
      `${bucket}/${track.objectKey}`,
      "--file",
      sourcePath,
      "--content-type",
      contentType,
      "--cache-control",
      "public, max-age=31536000, immutable",
      "--remote"
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error(`Upload failed: ${track.filename}`);
  }

  state.objects[track.objectKey] = { size: sourceStat.size, mtimeMs: sourceStat.mtimeMs };
  saveState();
  uploaded += 1;
}

console.log(`R2 sync complete: uploaded ${uploaded}, skipped ${skipped}, total ${manifest.length} tracks in ${bucket}.`);
