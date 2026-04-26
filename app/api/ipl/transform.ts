import type {
  DailyChartRow,
  DashboardData,
  OverallChartItem,
  RawApiUser,
  ScrapedDashboardPayload,
  ScrapedLeaderboardItem,
} from "../../types";

const TOTAL_TRANSFERS = 160;
const FLOAT_TOLERANCE = 0.01;

const RAW_TEAM_ALIASES: Record<string, string> = {
  "Ghost Riders": "RushS01",
  "Pankaj Konde": "PKs11",
  "PKs 11": "PKs11",
  "Rishikesh Shinde": "Watapi",
  "Rushabh Shah": "RushS01",
  "VATVAGHOOL XI": "VATVAGHOOL XI",
  "Vijay Swami": "VATVAGHOOL XI",
  WATAPI11: "Watapi",
};

export const toFiniteNumber = (value: unknown) => {
  const numeric =
    typeof value === "string"
      ? Number(value.replace(/,/g, ""))
      : typeof value === "number"
      ? value
      : Number.NaN;

  return Number.isFinite(numeric) ? numeric : undefined;
};

export const addLeaderboardMetrics = (
  leaders: ScrapedLeaderboardItem[],
): OverallChartItem[] => {
  const sorted = [...leaders]
    .filter((l) => Number.isFinite(l.rank) && Number.isFinite(l.points))
    .sort((a, b) => a.rank - b.rank);

  const previousRankMap = new Map(
    sorted
      .map((l) => ({
        name: l.name,
        previousPoints: l.points - (l.lastMatchPoints ?? 0),
      }))
      .sort((a, b) => b.previousPoints - a.previousPoints)
      .map((l, i) => [l.name, i + 1]),
  );

  const maxLastMatchPoints = Math.max(
    ...sorted.map((l) => l.lastMatchPoints ?? 0),
  );

  const leaderboardRange = sorted.length
    ? sorted[0].points - sorted[sorted.length - 1].points
    : 0;

  return sorted.map((leader, index) => {
    const previousRank = previousRankMap.get(leader.name);
    const next = sorted[index + 1];

    const gapToNext = next ? leader.points - next.points : 0;

    const usedTransfers =
      typeof leader.transfersLeft === "number"
        ? Math.max(0, TOTAL_TRANSFERS - leader.transfersLeft)
        : 0;

    return {
      name: leader.name,
      points: leader.points,
      rank: leader.rank,
      previousRank,
      previousPoints: leader.points - (leader.lastMatchPoints ?? 0),
      lastMatchPoints: leader.lastMatchPoints,
      gapToNext,
      gapPercent: leaderboardRange
        ? (gapToNext / leaderboardRange) * 100
        : 0,
      movement:
        previousRank === undefined
          ? "new"
          : leader.rank < previousRank
          ? "up"
          : leader.rank > previousRank
          ? "down"
          : "same",
      transfersLeft: leader.transfersLeft,

      // ✅ FIX: NO null, only undefined
      boostersUsed:
        typeof leader.boostersUsed === "string"
          ? leader.boostersUsed.trim()
          : typeof leader.boostersUsed === "number"
          ? leader.boostersUsed
          : undefined,

      efficiency:
        usedTransfers > 0
          ? Math.round((leader.points / usedTransfers) * 100) / 100
          : undefined,

      isLastMatchLeader:
        (leader.lastMatchPoints ?? 0) > 0 &&
        leader.lastMatchPoints === maxLastMatchPoints,
    };
  });
};

export const normalizePayload = (
  payload: unknown,
): ScrapedDashboardPayload | null => {
  if (!payload || typeof payload !== "object" || !("leaders" in payload)) {
    return null;
  }

  const leaders = (payload as any).leaders;
  if (!Array.isArray(leaders)) return null;

  const normalized = leaders
    .map((item: any): ScrapedLeaderboardItem | null => {
      const rank = toFiniteNumber(item.rank);
      const points = toFiniteNumber(item.points);
      const lastMatchPoints = toFiniteNumber(item.lastMatchPoints);
      const transfersLeft = toFiniteNumber(item.transfersLeft);

      const name = typeof item.name === "string" ? item.name.trim() : "";

      if (!name || rank === undefined || points === undefined) return null;

      return {
        rank,
        name,
        points,
        lastMatchPoints,
        transfersLeft,

        // ✅ FIXED HERE TOO
        boostersUsed:
          typeof item.boostersUsed === "string"
            ? item.boostersUsed.trim()
            : typeof item.boostersUsed === "number"
            ? item.boostersUsed
            : undefined,
      };
    })
    .filter((x): x is ScrapedLeaderboardItem => Boolean(x))
    .sort((a, b) => a.rank - b.rank);

  return normalized.length
    ? {
        updatedAt: new Date().toISOString(),
        leaders: normalized,
      }
    : null;
};

export const buildDashboardFromSnapshot = (
  snapshot: ScrapedDashboardPayload,
  manualDashboard: DashboardData,
): DashboardData => {
  const liveDaily: DailyChartRow | null = snapshot.leaders.some(
    (l) => typeof l.lastMatchPoints === "number",
  )
    ? snapshot.leaders.reduce<DailyChartRow>(
        (row, leader) => {
          row[leader.name] = leader.lastMatchPoints ?? 0;
          return row;
        },
        { day: "Live Update" },
      )
    : null;

  return {
    // ✅ REQUIRED: include leaders
    leaders: snapshot.leaders,

    // ✅ keep analytics
    overall: addLeaderboardMetrics(snapshot.leaders),

    // ✅ safe merge
    daily: liveDaily
      ? [...(manualDashboard.daily ?? []), liveDaily]
      : manualDashboard.daily ?? [],

    // ✅ preserve other existing fields (important)
    leagueData: manualDashboard.leagueData ?? [],

    updatedAt: snapshot.updatedAt,
    source: "live-snapshot",
  };
};