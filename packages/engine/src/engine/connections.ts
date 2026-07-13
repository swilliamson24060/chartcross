import { bestConnectionReason, connectionPoints } from "./moves";
import { Board, ConnectionReason, GRID_SIZE, Tile } from "./types";

export interface BoardConnection {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  tileA: Tile;
  tileB: Tile;
  reason: ConnectionReason;
  points: number;
}

/**
 * Every legally-matching adjacent pair of placed tiles currently on the
 * board (each pair counted once). This is the same adjacency-matching
 * logic used to draw the board's connector lines, factored out so it can
 * also back a textual connections list.
 */
export function getAllConnections(board: Board): BoardConnection[] {
  const connections: BoardConnection[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (!cell.tile) continue;

      const right = col + 1 < GRID_SIZE ? board[row][col + 1] : undefined;
      const down = row + 1 < GRID_SIZE ? board[row + 1][col] : undefined;

      for (const neighbor of [right, down]) {
        if (!neighbor?.tile) continue;
        const reason = bestConnectionReason(cell.tile, neighbor.tile);
        if (!reason) continue;
        connections.push({
          fromRow: row,
          fromCol: col,
          toRow: neighbor.row,
          toCol: neighbor.col,
          tileA: cell.tile,
          tileB: neighbor.tile,
          reason,
          points: connectionPoints(reason),
        });
      }
    }
  }

  return connections;
}
