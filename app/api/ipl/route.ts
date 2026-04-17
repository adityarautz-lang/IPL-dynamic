import { NextResponse } from "next/server";
import type { DailyChartRow, OverallChartItem, RawApiUser } from "../../types";
import { rawApiUsers } from "./data";

export async function GET() {
  const users: RawApiUser[] = rawApiUsers;

  // Sort users by total points to determine ranking
  const sortedByPoints = [...users].sort((a, b) => b.points - a.points);
  const rankMap = new Map(
    sortedByPoints.map((user, index) => [user.temname, index + 1]),
  );

  // ✅ Overall leaderboard sorted by points (highest to lowest) with correct ranking
  const overall: OverallChartItem[] = sortedByPoints.map((u) => ({
    name: u.temname,
    points: u.points,
    rank: rankMap.get(u.temname) || u.rno,
  }));

  // ✅ Daily data from actual matches (Match 1-25) sorted by points within each match
  const daily: DailyChartRow[] = Array.from({ length: 25 }, (_, matchIndex) => {
    const matchId = matchIndex + 1;
    const matchScores: { team: string; points: number }[] = [];

    users.forEach((u) => {
      const matchData = u.matches.find((m) => m.matchId === matchId);
      matchScores.push({
        team: u.temname,
        points: matchData?.points ?? 0,
      });
    });

    // Sort by points descending (highest to lowest)
    matchScores.sort((a, b) => b.points - a.points);

    const row: DailyChartRow = { day: `Match ${matchId}` };
    matchScores.forEach(({ team, points }) => {
      row[team] = points;
    });

    return row;
  });

  return NextResponse.json({ overall, daily });
}
