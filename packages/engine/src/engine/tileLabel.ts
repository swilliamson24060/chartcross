import { Tile } from "./types";

export function tileLabel(tile: Tile): string {
  if (tile.kind === "ARTIST") return tile.name;
  if (tile.kind === "SONG") return tile.title;
  return "★ Wildcard";
}
