import { adjacentCells } from "./board";
import { bestConnectionReason } from "./moves";
import { Board } from "./types";
import { END_ANCHOR_POS, STARTER_POS } from "./board";

/**
 * True once STARTER and END_ANCHOR are joined by a path of placed tiles
 * where every step in the path is itself a legally-matching (adjacent +
 * year/peak/collab) edge. Plain physical adjacency of two placed tiles
 * that don't match anything is not a graph edge.
 */
export function isStarterConnectedToAnchor(board: Board): boolean {
  const startCell = board[STARTER_POS.row][STARTER_POS.col];
  if (!startCell.tile) return false;

  const visited = new Set<string>();
  const stack = [startCell];
  visited.add(`${startCell.row},${startCell.col}`);

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.row === END_ANCHOR_POS.row && current.col === END_ANCHOR_POS.col) {
      return true;
    }
    for (const neighbor of adjacentCells(board, current.row, current.col)) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (visited.has(key) || !neighbor.tile || !current.tile) continue;
      if (bestConnectionReason(current.tile, neighbor.tile) === null) continue;
      visited.add(key);
      stack.push(neighbor);
    }
  }
  return false;
}
