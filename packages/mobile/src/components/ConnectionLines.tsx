import React from "react";
import Svg, { Line } from "react-native-svg";
import { bestConnectionReason, Board, GRID_SIZE } from "@chartcross/engine";
import { connectionColors } from "../theme";

interface Props {
  board: Board;
  cellSize: number;
}

export function ConnectionLines({ board, cellSize }: Props) {
  const size = cellSize * GRID_SIZE;
  const lines: React.ReactNode[] = [];
  const center = (row: number, col: number) => ({
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2,
  });

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
        const a = center(row, col);
        const b = center(neighbor.row, neighbor.col);
        lines.push(
          <Line
            key={`${row}-${col}-${neighbor.row}-${neighbor.col}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={connectionColors[reason]}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.85}
          />,
        );
      }
    }
  }

  return (
    <Svg
      width={size}
      height={size}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {lines}
    </Svg>
  );
}
