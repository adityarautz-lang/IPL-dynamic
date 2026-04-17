import { NextResponse } from "next/server";
import type { DailyChartRow, OverallChartItem, RawApiUser } from "../../types";
import { rawApiUsers } from "./data";

export async function GET() {
  const users: RawApiUser[] = rawApiUsers;

  // ✅ Overall leaderboard
  const overall: OverallChartItem[] = users.map((u) => ({
    name: u.temname,
    points: u.points,
    rank: u.rno,
  }));

  // ⚠️ Daily data not present → simulate for now
  const daily: DailyChartRow[] = ["Match 1", "Match 2", "Match 3"].map(
    (day) => {
      const row: DailyChartRow = { day };

      users.forEach((u) => {
        row[u.temname] = Math.floor(u.points / 10 + Math.random() * 50);
      });

      return row;
    },
  );

  return NextResponse.json({ overall, daily });
}
