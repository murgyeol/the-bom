import { readFileSync } from "node:fs";

const manifestPath = new URL("../src/data/tracks.json", import.meta.url);
const requiredFields = ["id", "order", "title", "artist", "filename", "objectKey", "duration", "format", "size"];

function fail(message) {
  console.error(`Track manifest validation failed: ${message}`);
  process.exit(1);
}

let tracks;
try {
  tracks = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail(`could not read src/data/tracks.json (${error.message}).`);
}

if (!Array.isArray(tracks)) fail("src/data/tracks.json must contain an array.");
if (tracks.length !== 85) fail(`expected 85 tracks, found ${tracks.length}.`);

const ids = new Set();
const objectKeys = new Set();
const formats = { wav: 0, mp3: 0 };

for (const [index, track] of tracks.entries()) {
  if (!track || typeof track !== "object") fail(`track ${index + 1} must be an object.`);

  for (const field of requiredFields) {
    if (track[field] === undefined || track[field] === null || track[field] === "") {
      fail(`track ${index + 1} is missing ${field}.`);
    }
  }

  if (typeof track.id !== "string") fail(`track ${index + 1} has an invalid id.`);
  if (ids.has(track.id)) fail(`duplicate id: ${track.id}.`);
  ids.add(track.id);

  if (!Number.isInteger(track.order) || track.order < 1) fail(`track ${track.id} has an invalid order.`);
  if (typeof track.title !== "string" || typeof track.artist !== "string" || typeof track.filename !== "string") {
    fail(`track ${track.id} has invalid text metadata.`);
  }

  if (typeof track.objectKey !== "string" || !track.objectKey.startsWith("tracks/")) {
    fail(`track ${track.id} has an invalid objectKey.`);
  }
  if (objectKeys.has(track.objectKey)) fail(`duplicate objectKey: ${track.objectKey}.`);
  objectKeys.add(track.objectKey);

  if (track.format !== "wav" && track.format !== "mp3") fail(`track ${track.id} has an invalid format.`);
  formats[track.format] += 1;

  if (!Number.isFinite(track.duration) || track.duration < 0) fail(`track ${track.id} has an invalid duration.`);
  if (!Number.isInteger(track.size) || track.size <= 0) fail(`track ${track.id} has an invalid size.`);
}

if (formats.wav !== 77 || formats.mp3 !== 8) {
  fail(`expected 77 WAV and 8 MP3 tracks, found ${formats.wav} WAV and ${formats.mp3} MP3.`);
}

console.log(`Validated ${tracks.length} tracks: ${formats.wav} WAV, ${formats.mp3} MP3.`);
