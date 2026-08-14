import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const sourceDir = new URL("../the-bom-wav/", import.meta.url);
const outputDir = new URL("../src/data/", import.meta.url);
const outputFile = new URL("tracks.json", outputDir);
const supportedFormats = new Set([".wav", ".mp3"]);

function durationFor(path) {
  try {
    const value = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path],
      { encoding: "utf8" }
    ).trim();
    return Math.round(Number(value) * 100) / 100;
  } catch {
    return 0;
  }
}

function cleanTitle(filename) {
  return filename
    .replace(/\.(wav|mp3)$/i, "")
    .replace(/^(?:G-)?\d+[\s_-]*/i, "")
    .replace(/_/g, " ")
    .trim();
}

const files = readdirSync(sourceDir, { encoding: "utf8" })
  .filter((filename) => supportedFormats.has(extname(filename).toLowerCase()))
  .sort((left, right) => left.localeCompare(right, "ko", { numeric: true }));

const tracks = files.map((filename, index) => {
  const path = join(sourceDir.pathname, filename);
  const format = extname(filename).slice(1).toLowerCase();
  const match = filename.match(/^(\d+)/);

  return {
    id: match?.[1] ?? String(index + 1).padStart(3, "0"),
    order: index + 1,
    title: cleanTitle(filename),
    artist: "정성원",
    filename,
    objectKey: `tracks/${filename}`,
    duration: durationFor(path),
    format,
    size: statSync(path).size
  };
});

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(tracks, null, 2)}\n`, "utf8");
console.log(`Generated ${tracks.length} tracks at src/data/tracks.json`);
