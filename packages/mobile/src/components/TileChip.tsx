import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Tile } from "@chartcross/engine";
import { colors } from "../theme";

interface Props {
  tile: Tile;
  size: number;
  role?: "STARTER" | "END_ANCHOR";
  selected?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
}

export function TileChip({ tile, size, role, selected, dimmed, onPress }: Props) {
  const isArtist = tile.kind === "ARTIST";
  const isWildcard = tile.kind === "WILDCARD";
  const accent = isWildcard ? colors.wildcard : isArtist ? colors.artist : colors.song;
  const backgroundColor = isWildcard
    ? colors.wildcardDim
    : isArtist
      ? colors.artistDim
      : colors.songDim;
  const label = tile.kind === "ARTIST" ? tile.name : tile.kind === "SONG" ? tile.title : "★ WILD";

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
});
