import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tileValue, type Tile } from "@chartcross/engine";
import { colors } from "../theme";

interface Props {
  tile: Tile;
  size: number;
  role?: "STARTER" | "END_ANCHOR";
  selected?: boolean;
  dimmed?: boolean;
  showValue?: boolean;
  onPress?: () => void;
}

export function TileChip({ tile, size, role, selected, dimmed, showValue, onPress }: Props) {
  const isArtist = tile.kind === "ARTIST";
  const isWildcard = tile.kind === "WILDCARD";
  const accent = isWildcard ? colors.wildcard : isArtist ? colors.artist : colors.song;
  const backgroundColor = isWildcard
    ? colors.wildcardDim
    : isArtist
      ? colors.artistDim
      : colors.songDim;
  const label = tile.kind === "ARTIST" ? tile.name : tile.kind === "SONG" ? tile.title : "★ WILD";
  const value = tileValue(tile);

  const content = (
    <View
      style={[
        styles.chip,
        {
          width: size,
          height: size,
          borderColor: accent,
          backgroundColor,
          borderWidth: selected ? 3 : role ? 2.5 : 1.5,
          opacity: dimmed ? 0.55 : 1,
          boxShadow: selected || role || isWildcard ? `0 0 6px ${accent}` : undefined,
        },
      ]}
    >
      <Text
        numberOfLines={3}
        style={[styles.label, { fontSize: Math.max(8, size * 0.155) }]}
      >
        {label}
      </Text>
      {showValue && value > 0 && (
        <View style={[styles.valueBadge, { borderColor: accent }]}>
          <Text style={styles.valueBadgeText}>{value}</Text>
        </View>
      )}
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center",
  },
  valueBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  valueBadgeText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: "800",
  },
});
