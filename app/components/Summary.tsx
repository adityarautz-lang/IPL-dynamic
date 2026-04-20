"use client";

import { useMemo } from "react";

type Leader = {
  rank?: number;
  name: string;
  points: number;
  matchId?: number;
  lastMatchPoints?: number;
  transfersLeft?: number;
  boostersUsed?: string | null;
};

type DashboardData = {
  updatedAt: string | null;
  leaders: Leader[];
};

export default function Summary({ data }: { data: DashboardData }) {
  // ✅ Safe data extraction
  const list = Array.isArray(data?.leaders) ? data.leaders : [];

  const matchCount = list.length;

  const { cards } = useMemo(() => {
    if (!list.length) {
      return {
        cards: [
          { label: "Total Players", value: 0 },
          { label: "Top Score", value: 0 },
          { label: "Avg Points", value: 0 },
          { label: "Matches Tracked", value: 0 },
        ],
      };
    }

    const totalPlayers = list.length;

    const topScore = Math.max(...list.map((p) => p.points || 0));

    const avgPoints =
      list.reduce((sum, p) => sum + (p.points || 0), 0) / totalPlayers;

    return {
      cards: [
        { label: "Total Players", value: totalPlayers },
        { label: "Top Score", value: topScore.toFixed(0) },
        { label: "Avg Points", value: avgPoints.toFixed(1) },
        { label: "Matches Tracked", value: matchCount },
      ],
    };
  }, [list, matchCount]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
        >
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="text-xl font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}