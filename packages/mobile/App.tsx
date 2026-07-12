import React, { useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Cell, GameEngine, GRID_SIZE, MoveResult } from "@chartcross/engine";
import { dataset } from "./src/dataset";
import { colors } from "./src/theme";
import { BoardGrid } from "./src/components/BoardGrid";
import { Rack } from "./src/components/Rack";
import { TileInfoModal } from "./src/components/TileInfoModal";

const LEVEL_NAMES = [
  "THE COLLABORATIVE WEB",
  "CHART TOPPERS",
  "ONE HIT WONDERS",
  "THE FEATURING CIRCUIT",
  "PEAK PERFORMANCE",
];

function newEngine(levelNumber: number) {
  return new GameEngine(dataset, levelNumber, Date.now() + levelNumber);
}

export default function App() {
  const { width } = useWindowDimensions();
  const [levelNumber, setLevelNumber] = useState(1);
  const engineRef = useRef<GameEngine>(newEngine(levelNumber));
  const [gameState, setGameState] = useState(() => engineRef.current.getState());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [infoCell, setInfoCell] = useState<Cell | null>(null);

  const boardPixelWidth = Math.min(width - 24, 520);
  const cellSize = Math.floor(boardPixelWidth / GRID_SIZE);

  const legalMoves = useMemo(() => {
    if (selectedIndex === null) return [];
    return engineRef.current.legalMovesForRackTile(selectedIndex);
  }, [selectedIndex, gameState]);

  const highlightCells = useMemo(
    () => new Set(legalMoves.map((m) => `${m.row},${m.col}`)),
    [legalMoves],
  );

  function refresh() {
    setGameState(engineRef.current.getState());
  }

  function showToast(text: string, error?: boolean) {
    setToast({ text, error });
    setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 1800);
  }

  function handleSelectRackTile(index: number) {
    setSelectedIndex((current) => (current === index ? null : index));
  }

  function handleCellPress(row: number, col: number) {
    const cell = gameState.board[row][col];
    if (cell.tile) {
      setInfoCell(cell);
      return;
    }
    if (selectedIndex === null) return;
    const result: MoveResult = engineRef.current.placeTile(selectedIndex, row, col);
    if (!result.legal) {
      showToast(result.reason ?? "Illegal move.", true);
      return;
    }
    setSelectedIndex(null);
    refresh();
    const breakdown = result.tileValue > 0 ? ` (${result.connectionScore} conn + ${result.tileValue} tile)` : "";
    const multiplier = result.multiplierApplied ? ` [${result.multiplierApplied}]` : "";
    showToast(`+${result.finalScore} pts${breakdown}${multiplier}`);
    if (result.won) {
      setTimeout(() => showToast("LEVEL COMPLETE! Connected to END ANCHOR 🎉"), 400);
    }
  }

  function handleShuffle() {
    engineRef.current.shuffleRack();
    refresh();
  }

  function handleHint() {
    if (selectedIndex !== null) return;
    const state = engineRef.current.getState();
    for (let i = 0; i < state.rack.length; i++) {
      if (engineRef.current.legalMovesForRackTile(i).length > 0) {
        setSelectedIndex(i);
        return;
      }
    }
    showToast("No legal moves in the current rack — try Shuffle.", true);
  }

  function handleNewGame() {
    const next = levelNumber + 1;
    setLevelNumber(next);
    engineRef.current = newEngine(next);
    setSelectedIndex(null);
    setToast(null);
    refresh();
  }

  const levelName = LEVEL_NAMES[(levelNumber - 1) % LEVEL_NAMES.length];

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>CHART CROSS</Text>
      </View>
      <View style={styles.subheader}>
        <Text style={styles.levelText}>
          LEVEL {levelNumber}: {levelName}
        </Text>
        <Text style={styles.scoreText}>SCORE: {gameState.score.toLocaleString()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.boardWrap, { width: cellSize * GRID_SIZE }]}>
          <BoardGrid
            board={gameState.board}
            cellSize={cellSize}
            highlightCells={highlightCells}
            onCellPress={handleCellPress}
          />
        </View>

        <View style={styles.toastSlot}>
          {toast && (
            <Text style={[styles.toast, toast.error && styles.toastError]}>{toast.text}</Text>
          )}
        </View>

        <Rack
          rack={gameState.rack}
          selectedIndex={selectedIndex}
          onSelect={handleSelectRackTile}
          onShuffle={handleShuffle}
          onHint={handleHint}
        />

        {gameState.won && (
          <Pressable style={styles.newGameButton} onPress={handleNewGame}>
            <Text style={styles.newGameText}>NEXT LEVEL →</Text>
          </Pressable>
        )}
      </ScrollView>

      <TileInfoModal cell={infoCell} dataset={dataset} onClose={() => setInfoCell(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 48,
  },
  header: {
    backgroundColor: colors.headerBackground,
    paddingVertical: 12,
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2,
  },
  subheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#0f1a33",
  },
  levelText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 11,
    flexShrink: 1,
  },
  scoreText: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 12,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 40,
  },
  boardWrap: {
    marginBottom: 8,
  },
  toastSlot: {
    height: 28,
    justifyContent: "center",
  },
  toast: {
    color: colors.year,
    fontWeight: "700",
    fontSize: 13,
  },
  toastError: {
    color: colors.illegal,
  },
  newGameButton: {
    marginTop: 16,
    backgroundColor: colors.artist,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newGameText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
