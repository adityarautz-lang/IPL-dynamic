"use client";

import { computeTrivia } from "../utils/computeTrivia";

export default function Trivia({ data }: { data: any[] }) {
  const insights = computeTrivia(data);

  if (!insights) return null;

  // 👉 compute all averages for display
  const teamAverages =
    data.map((team) => {
      const matches = team.matches || [];

      const avg =
        matches.reduce(
          (sum: number, m: any) => sum + (m.points || 0),
          0
        ) / (matches.length || 1);

      return {
        team: team.teamName,
        avg,
      };
    }) || [];

  const topTeams = [...teamAverages]
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);

  return (
    <div className="mt-6 p-4 border rounded-lg bg-white text-gray-900">
      <h2 className="text-lg font-semibold mb-4">🧠 Trivia</h2>

      <div className="space-y-3 text-sm">

        {/* 🔥 CORE INSIGHTS */}
        <div>
          🏆 Highest Score:{" "}
          <span className="font-semibold">
            {insights.highest.team}
          </span>{" "}
          ({insights.highest.points} pts – Match {insights.highest.match})
        </div>

        <div>
          💀 Lowest Score:{" "}
          <span className="font-semibold">
            {insights.lowest.team}
          </span>{" "}
          ({insights.lowest.points} pts – Match {insights.lowest.match})
        </div>

        {/* 📊 AVERAGE SUMMARY */}
        <div className="mt-3 pt-3 border-t">
          <div>
            📈 Best Avg:{" "}
            <span className="font-semibold text-green-600">
              {insights.bestAvg.team}
            </span>{" "}
            ({insights.bestAvg.avg.toFixed(0)} pts)
          </div>

          <div>
            📉 Worst Avg:{" "}
            <span className="font-semibold text-red-500">
              {insights.worstAvg.team}
            </span>{" "}
            ({insights.worstAvg.avg.toFixed(0)} pts)
          </div>
        </div>

        {/* 🔝 TOP 3 AVERAGE TEAMS */}
        <div className="mt-3 pt-3 border-t">
          <div className="font-medium mb-1">Top Avg Teams</div>

          {topTeams.map((t, i) => (
            <div key={i}>
              {i + 1}.{" "}
              <span className="font-semibold">{t.team}</span>{" "}
              ({t.avg.toFixed(0)})
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}