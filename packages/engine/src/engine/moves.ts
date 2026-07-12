import { ConnectionReason, REASON_POINTS, Tile } from "./types";

function tileYears(tile: Tile): number[] {
  return tile.kind === "SONG" ? [tile.peakYear] : tile.years;
}

function tilePeaks(tile: Tile): number[] {
  return tile.kind === "SONG" ? [tile.peakPos] : tile.peaks;
}

function intersects(a: number[], b: number[]): boolean {
  const set = new Set(a);
  return b.some((v) => set.has(v));
}

function isCollab(a: Tile, b: Tile): boolean {
  if (a.kind === "ARTIST" && b.kind === "ARTIST") {
    return a.collaboratorIds.includes(b.id);
  }
  if (a.kind === "ARTIST" && b.kind === "SONG") {
    return b.performerIds.includes(a.id);
  }
  if (a.kind === "SONG" && b.kind === "ARTIST") {
    return a.performerIds.includes(b.id);
  }
  // SONG-SONG: no collaboration tier, only artists collaborate.
  return false;
}

/**
 * The single best-scoring reason two tiles may legally connect, or null if
 * no rule matches. Only the strongest applicable tier is awarded per edge,
 * they are not summed.
 */
export function bestConnectionReason(a: Tile, b: Tile): ConnectionReason | null {
  if (isCollab(a, b)) return "COLLAB";
  if (intersects(tilePeaks(a), tilePeaks(b))) return "PEAK";
  if (intersects(tileYears(a), tileYears(b))) return "YEAR";
  return null;
}

export function connectionPoints(reason: ConnectionReason): number {
  return REASON_POINTS[reason];
}
