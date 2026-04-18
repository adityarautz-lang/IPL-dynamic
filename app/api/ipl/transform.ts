import type {
  DailyChartRow,
  DashboardData,
  OverallChartItem,
  RawApiUser,
  ScrapedDashboardPayload,
  ScrapedLeaderboardItem,
} from "../../types";

const TOTAL_TRANSFERS = 210;
const FLOAT_TOLERANCE = 0.01;

const RAW_TEAM_ALIASES: Record<string, string> = {
  "Ghost Riders": "RushS01",
  "Pankaj Konde": "PKs11",
  "PKs 11": "PKs11",
  "Rishikesh Shinde": "Watapi",
  "Rushabh Shah": "RushS01",
  "VATVAGHOOL XI": "VATVAGHOOL XI",
  "Vijay Swami": "VATVAGHOOL XI",
  "WATAPI11": "Watapi",
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
    .filter(
      (leader) =>
        Number.isFinite(leader.rank) && Number.isFinite(leader.points),
    )
    .sort((a, b) => a.rank - b.rank);
  const previousRankMap = new Map(
    sorted
      .map((leader) => ({
        name: leader.name,
        previousPoints: leader.points - (leader.lastMatchPoints ?? 0),
      }))
      .sort((a, b) => b.previousPoints - a.previousPoints)
      .map((leader, index) => [leader.name, index + 1]),
  );
  const maxLastMatchPoints = Math.max(
    ...sorted.map((leader) => leader.lastMatchPoints ?? 0),
  );
  const leaderboardRange = sorted.length
    ? sorted[0].points - sorted[sorted.length - 1].points
    : 0;

  return sorted.map((leader, index) => {
    const previousRank = previousRankMap.get(leader.name);
    const nextLeader = sorted[index + 1];
    const gapToNext = nextLeader ? leader.points - nextLeader.points : 0;
    const usedTransfers =
      typeof leader.transfersLeft === "number"
        ? TOTAL_TRANSFERS - leader.transfersLeft
        : 0;

    return {
      name: leader.name,
      points: leader.points,
      rank: leader.rank,
      previousRank,
      previousPoints: leader.points - (leader.lastMatchPoints ?? 0),
      lastMatchPoints: leader.lastMatchPoints,
      gapToNext,
      gapPercent: leaderboardRange ? (gapToNext / leaderboardRange) * 100 : 0,
      movement:
        previousRank === undefined
          ? "new"
          : leader.rank < previousRank
            ? "up"
            : leader.rank > previousRank
              ? "down"
              : "same",
      transfersLeft: leader.transfersLeft,
      boostersUsed: leader.boostersUsed,
      efficiency:
        usedTransfers > 0
          ? Number((leader.points / usedTransfers).toFixed(2))
          : undefined,
      isLastMatchLeader:
        (leader.lastMatchPoints ?? 0) > 0 &&
        leader.lastMatchPoints === maxLastMatchPoints,
    };
  });
};

export const buildManualDashboard = (users: RawApiUser[]): DashboardData => {
  const latestMatchId = users.reduce((latest, user) => {
    const userLatest = user.matches.reduce(
      (max, match) => Math.max(max, match.matchId),
      0,
    );

    return Math.max(latest, userLatest);
  }, 0);
  const sortedByPoints = [...users].sort((a, b) => b.points - a.points);
  const leaders = sortedByPoints.map((user, index) => ({
    rank: index + 1,
    name: user.temname,
    points: user.points,
    lastMatchPoints:
      user.matches.find((match) => match.matchId === latestMatchId)?.points ??
      0,
  }));

  const daily: DailyChartRow[] = Array.from({ length: latestMatchId }, (_, i) => {
    const matchId = i + 1;
    const matchScores = users
      .map((user) => ({
        team: user.temname,
        points:
          user.matches.find((match) => match.matchId === matchId)?.points ?? 0,
      }))
      .sort((a, b) => b.points - a.points);
    const row: DailyChartRow = { day: `Match ${matchId}` };

    matchScores.forEach(({ team, points }) => {
      row[team] = points;
    });

    return row;
  });

  return {
    overall: addLeaderboardMetrics(leaders),
    daily,
    source: "manual",
  };
};

export const normalizePayload = (
  payload: unknown,
): ScrapedDashboardPayload | null => {
  if (!payload || typeof payload !== "object" || !("leaders" in payload)) {
    return null;
  }

  const leaders = (payload as { leaders: unknown }).leaders;
  if (!Array.isArray(leaders)) return null;

  const normalized = leaders
    .map((leader): ScrapedLeaderboardItem | null => {
      if (!leader || typeof leader !== "object") return null;
      const item = leader as Record<string, unknown>;
      const rank = toFiniteNumber(item.rank);
      const points = toFiniteNumber(item.points);
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const lastMatchPoints = toFiniteNumber(item.lastMatchPoints);
      const transfersLeft = toFiniteNumber(item.transfersLeft);

      if (!name || rank === undefined || points === undefined) return null;

      return {
        rank,
        name,
        points,
        lastMatchPoints,
        transfersLeft,
        boostersUsed:
          typeof item.boostersUsed === "string"
            ? item.boostersUsed.trim()
            : undefined,
      };
    })
    .filter((leader): leader is ScrapedLeaderboardItem => Boolean(leader))
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
    (leader) => typeof leader.lastMatchPoints === "number",
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
    overall: addLeaderboardMetrics(snapshot.leaders),
    daily: liveDaily ? [...manualDashboard.daily, liveDaily] : manualDashboard.daily,
    updatedAt: snapshot.updatedAt,
    source: "live-snapshot",
  };
};

const normalizeTeamName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

const calculateTotalPoints = (user: RawApiUser) =>
  user.matches.reduce((sum, match) => sum + match.points, 0);

const roundPoint = (value: number) => Math.round(value * 10) / 10;

const findRawUserIndex = (users: RawApiUser[], scrapedName: string) => {
  const alias = RAW_TEAM_ALIASES[scrapedName];
  const target = normalizeTeamName(alias ?? scrapedName);

  return users.findIndex((user) => normalizeTeamName(user.temname) === target);
};

export type RawUsersSyncResult = {
  status: "updated" | "unchanged" | "skipped";
  users: RawApiUser[];
  matchId?: number;
  mode?: "append" | "update-latest";
  unmatchedNames: string[];
};

export const syncRawUsersWithSnapshot = (
  users: RawApiUser[],
  snapshot: ScrapedDashboardPayload,
): RawUsersSyncResult => {
  const clonedUsers = users.map((user) => ({
    ...user,
    matches: user.matches.map((match) => ({ ...match })),
  }));
  const maxMatchId = clonedUsers.reduce(
    (max, user) =>
      Math.max(max, ...user.matches.map((match) => match.matchId)),
    0,
  );
  const unmatchedNames: string[] = [];
  const updates = snapshot.leaders.flatMap((leader) => {
    const userIndex = findRawUserIndex(clonedUsers, leader.name);

    if (userIndex < 0) {
      unmatchedNames.push(leader.name);
      return [];
    }

    const user = clonedUsers[userIndex];
    const currentTotal = calculateTotalPoints(user);
    const delta = roundPoint(leader.points - currentTotal);
    const latestMatch = user.matches.find((match) => match.matchId === maxMatchId);

    return [
      {
        userIndex,
        delta,
        latestMatchPoints: leader.lastMatchPoints,
        currentLatestPoints: latestMatch?.points ?? 0,
      },
    ];
  });

  if (!updates.length) {
    return {
      status: "skipped",
      users: clonedUsers,
      unmatchedNames,
    };
  }

  const changedUpdates = updates.filter(
    (update) => Math.abs(update.delta) > FLOAT_TOLERANCE,
  );

  if (!changedUpdates.length) {
    return {
      status: "unchanged",
      users: clonedUsers,
      matchId: maxMatchId,
      unmatchedNames,
    };
  }

  const updatesFitLatestMatch = changedUpdates.every((update) => {
    if (typeof update.latestMatchPoints !== "number") return false;

    return (
      Math.abs(
        update.currentLatestPoints + update.delta - update.latestMatchPoints,
      ) <= FLOAT_TOLERANCE
    );
  });
  const mode = updatesFitLatestMatch ? "update-latest" : "append";
  const matchId = mode === "append" ? maxMatchId + 1 : maxMatchId;

  changedUpdates.forEach((update) => {
    const user = clonedUsers[update.userIndex];

    if (mode === "update-latest") {
      const latestMatch = user.matches.find((match) => match.matchId === matchId);

      if (latestMatch) {
        latestMatch.points = roundPoint(latestMatch.points + update.delta);
      } else {
        user.matches.push({ matchId, points: update.delta });
      }
    } else {
      user.matches.push({ matchId, points: update.delta });
    }

    user.points = calculateTotalPoints(user);
  });

  return {
    status: "updated",
    users: clonedUsers,
    matchId,
    mode,
    unmatchedNames,
  };
};

export const serializeRawApiUsersModule = (users: RawApiUser[]) => {
  const usersForSource = users.map((user) => ({
    rno: user.rno,
    temname: user.temname,
    points: 0,
    matches: [...user.matches].sort((a, b) => a.matchId - b.matchId),
  }));

  return `import type { RawApiUser } from "../../types";

const calculateTotalPoints = (
  matches: Array<{ matchId: number; points: number }>,
): number => {
  return matches.reduce((sum, match) => sum + match.points, 0);
};

export const rawApiUsers: RawApiUser[] = ${JSON.stringify(usersForSource, null, 2)}
  .map((user) => ({
    ...user,
    points: calculateTotalPoints(user.matches),
  }));
`;
};
