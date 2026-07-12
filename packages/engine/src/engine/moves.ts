import { ConnectionReason, MatchableTile, REASON_POINTS, Tile } from "./types";

function tileYears(tile: MatchableTile): number[] {
  return tile.kind === "SONG" ? [tile.peakYear] : tile.years;
}

function tilePeaks(tile: MatchableTile): number[] {
  return tile.kind === "SONG" ? [tile.peakPos] : tile.peaks;
}

function intersects(a: number[], b: number[]): boolean {
  const set = new Set(a);
  return b.some((v) => set.has(v));
}

function isCollab(a: MatchableTile, b: MatchableTile): boolean {
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
 *
 * A wildcard tile connects to anything (and anything connects to it) worth
 * zero points - it's a rescue/bridging tool, not a scoring play. It also
 * stays wild permanently: once placed, any future neighbor of it is legal
 * too, since this same check runs for every adjacent pair on the board.
 */
export function bestConnectionReason(a: Tile, b: Tile): ConnectionReason | null {
  if (a.kind === "WILDCARD" || b.kind === "WILDCARD") return "WILDCARD";
  if (isCollab(a, b)) return "COLLAB";
  if (intersects(tilePeaks(a), tilePeaks(b))) return "PEAK";
  if (intersects(tileYears(a), tileYears(b))) return "YEAR";
  return null;
}

export function connectionPoints(reason: ConnectionReason): number {
  return REASON_POINTS[reason];
}
