import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CHART_BOOST_FLAT_BONUS, decadePoints, REASON_POINTS, WILD_TILE_COST } from "@chartcross/engine";
import { colors } from "../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, color ? { color } : null]}>{title}</Text>
      {children}
    </View>
  );
}

function ScoreRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.scoreRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, { color }]}>{value}</Text>
    </View>
  );
}

export function HowToPlayModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>HOW TO PLAY</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Section title="GOAL">
              <Text style={styles.body}>
                Place tiles from your rack onto the board to rack up points. Careful — the game
                can end suddenly, and when it does, it costs you.
              </Text>
            </Section>

            <Section title="PLACING TILES">
              <Text style={styles.body}>
                Tap a rack tile, then tap a highlighted cell next to it on the board. A placement
                is legal only if the new tile shares a Year, Peak Chart Position, or a
                Collaborating Artist with a tile already touching that cell — or if it's a ★
                Wildcard, which connects to anything.
              </Text>
            </Section>

            <Section title="SCORING">
              <ScoreRow label="Same Year" value={`+${REASON_POINTS.YEAR}`} color={colors.year} />
              <ScoreRow label="Same Peak Position" value={`+${REASON_POINTS.PEAK}`} color={colors.peak} />
              <ScoreRow label="Collaborating Artists" value={`+${REASON_POINTS.COLLAB}`} color={colors.collab} />
              <ScoreRow label="Wildcard connection" value={`+${REASON_POINTS.WILDCARD}`} color={colors.wildcard} />
              <Text style={styles.body}>
                Every tile also carries its own Point Value (the badge on rack tiles), based on
                the decade it charted in — 2020s is worth {decadePoints(2023)}, all the way back
                to the 1950s at {decadePoints(1958)}. Older is worth more. This value is added on
                top of the connection score whenever you place it.
              </Text>
              <Text style={styles.body}>
                Landing on a 2X or 3X SONG/ARTIST cell multiplies your connection score if the
                tile type matches. CHART BOOST adds a flat +{CHART_BOOST_FLAT_BONUS}. Multipliers
                never apply to Wildcards.
              </Text>
            </Section>

            <Section title="GAME OVER — WATCH OUT" color={colors.illegal}>
              <Text style={styles.body}>
                The game ends immediately, and you lose points equal to the total value of every
                tile left in your rack, if either of these happens:
              </Text>
              <Text style={styles.bullet}>
                •  STARTER and END ANCHOR become linked by a path of touching tiles — even tiles
                that don't score anything together.
              </Text>
              <Text style={styles.bullet}>•  None of your rack tiles have any legal placement left.</Text>
            </Section>

            <Section title="TOOLS">
              <Text style={styles.bullet}>💡 HINT — selects a playable tile and highlights where it can go.</Text>
              <Text style={styles.bullet}>⇄ SHUFFLE — reorders your rack.</Text>
              <Text style={styles.bullet}>
                ✨ BUY WILD ({WILD_TILE_COST}) — spend points to add a wildcard tile to your rack.
              </Text>
              <Text style={styles.bullet}>📊 CONNECTIONS — view every scored connection on the board.</Text>
              <Text style={styles.bullet}>Tap any placed tile to see its full details.</Text>
            </Section>
          </ScrollView>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>START PLAYING</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 8, 18, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    backgroundColor: colors.headerBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cellBorder,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: {
    marginBottom: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  scoreLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  button: {
    backgroundColor: colors.artist,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
