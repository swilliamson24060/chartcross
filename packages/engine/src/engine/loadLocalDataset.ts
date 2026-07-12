// Node-only helper for local dev/testing. Reads the JSON produced by
// scripts/build_dataset.py from disk. The engine itself never imports this -
// a React Native build will bundle/import the JSON assets a different way.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildDataset, Dataset } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../../data");

export function loadLocalDataset(): Dataset {
  const rawSongs = JSON.parse(readFileSync(path.join(DATA_DIR, "songs.json"), "utf-8"));
  const rawArtists = JSON.parse(readFileSync(path.join(DATA_DIR, "artists.json"), "utf-8"));
  return buildDataset(rawSongs, rawArtists);
}
