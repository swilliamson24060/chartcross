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
import { Cell, GameEngine, getAllConnections, GRID_SIZE, MoveResult } from "@chartcross/engine";
import { dataset } from "./src/dataset";
import { colors } from "./src/theme";
import { BoardGrid } from "./src/components/BoardGrid";
import { Rack } from "./src/components/Rack";
import { TileInfoModal } from "./src/components/TileInfoModal";
import { ConnectionsListModal } from "./src/components/ConnectionsListModal";

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
  const [showConnections, setShowConnections] = useState(false);

  const boardPixelWidth = Math.min(width - 24, 520);
  const cellSize = Math.floor(boardPixelWidth / GRID_SIZE);

  const connections = useMemo(() => getAllConnections(gameState.board), [gameState]);

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
    if (gameState.status !== "playing") return;
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
    if (result.status === "won") {
      setTimeout(() => showToast("LEVEL COMPLETE! Connected to END ANCHOR 🎉"), 400);
    } else if (result.status === "stuck") {
      setTimeout(() => showToast("No legal moves left — game over.", true), 400);
    }
  }

  function handleShuffle() {
    if (gameState.status !== "playing") return;
    engineRef.current.shuffleRack();
    refresh();
  }

  function handleHint() {
    if (gameState.status !== "playing" || selectedIndex !== null) return;
    const state = engineRef.current.getState();
    for (let i = 0; i < state.rack.length; i++) {
      if (engineRef.current.legalMovesForRackTile(i).length > 0) {
        setSelectedIndex(i);
        return;
      }
    }
    showToast("No legal moves in the current rack — try Shuffle.", true);
  }

  function handleRestart(sameLevel: boolean) {
    const next = sameLevel ? levelNumber : levelNumber + 1;
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
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>CHART CROSS</Text>
        <View style={styles.headerSpacer}>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => setShowConnections(true)}
            hitSlop={8}
          >
            <Text style={styles.headerIconText}>📊</Text>
          </Pressable>
        </View>
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

        {gameState.status === "won" && (
          <View style={styles.endPanel}>
            <Text style={styles.endTitleWon}>🎉 LEVEL COMPLETE</Text>
            <Pressable style={styles.newGameButton} onPress={() => handleRestart(false)}>
              <Text style={styles.newGameText}>NEXT LEVEL →</Text>
            </Pressable>
          </View>
        )}
        {gameState.status === "stuck" && (
          <View style={styles.endPanel}>
            <Text style={styles.endTitleStuck}>GAME OVER — No Moves Left</Text>
            <Pressable
              style={[styles.newGameButton, styles.retryButton]}
              onPress={() => handleRestart(true)}
            >
              <Text style={styles.newGameText}>TRY AGAIN ↻</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <TileInfoModal cell={infoCell} dataset={dataset} onClose={() => setInfoCell(null)} />
      <ConnectionsListModal
        visible={showConnections}
        connections={connections}
        onClose={() => setShowConnections(false)}
      />
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
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 32,
    alignItems: "flex-end",
  },
  headerIconButton: {
    padding: 4,
  },
  headerIconText: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
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
  endPanel: {
    alignItems: "center",
    marginTop: 8,
  },
  endTitleWon: {
    color: colors.year,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  endTitleStuck: {
    color: colors.illegal,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  newGameButton: {
    marginTop: 16,
    backgroundColor: colors.artist,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: colors.illegal,
  },
  newGameText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
