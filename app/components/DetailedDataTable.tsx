"use client";

import type { Leader } from "../types";

export default function DetailedDataTable({
  data,
  history,
}: {
  data?: Leader[];
  history?: any;
}) {
  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="mt-6">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 p-6">
            <h2 className="text-xl font-bold">📋 Detailed Leaderboard</h2>
            <p className="text-slate-400 text-sm">No data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...list]
    .map((d) => ({
      ...d,
      points: Number(d.points ?? 0),
      lastMatchPoints: Number(d.lastMatchPoints ?? 0),
      transfersLeft: Number(d.transfersLeft ?? 0),
    }))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  // 🔥 Build cumulative ranking for any match index
  const buildRankForMatch = (matchIndex: number) => {
    return history.teams
      .map((t: any) => {
        const total = t.history
          .slice(0, matchIndex + 1)
          .reduce((sum: number, m: any) => sum + (m.points || 0), 0);

        return {
          name: t.teamName,
          points: total,
        };
      })
      .sort((a: any, b: any) => b.points - a.points)
      .map((t: any, idx: number) => ({
        name: t.name,
        rank: idx + 1,
      }));
  };

  // 🔥 Get previous ranks correctly
  const getPrevRanks = () => {
    if (!history?.teams) return {};

    const prevRanks: Record<string, number> = {};

    const lastMatchIndex = history.teams[0]?.history?.length - 1;
    if (lastMatchIndex < 1) return {};

    const prevRanking = buildRankForMatch(lastMatchIndex - 1);

    prevRanking.forEach((t: any) => {
      prevRanks[t.name.toLowerCase().trim()] = t.rank;
    });

    return prevRanks;
  };

  const prevRanks = getPrevRanks();

  return (
    <div className="mt-6">
      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 p-3 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">
            📋 Detailed Leaderboard
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-sm text-left border-collapse">
              <thead className="bg-white/10 text-slate-300">
                <tr>
                  <th className="px-1.5 py-2 w-[45px]">Rk</th>
                  <th className="px-1.5 py-2">Name</th>
                  <th className="px-1.5 py-2 text-center">Pts</th>
                  <th className="px-1.5 py-2 text-center">LM</th>
                  <th className="px-1.5 py-2 text-center">Tr</th>
                  <th className="px-1.5 py-2 text-center">Bst</th>
                  <th className="px-1.5 py-2 text-center">Eff</th>
                </tr>
              </thead>

              <tbody>
                {sorted.map((row, idx) => {
                  const rank = row.rank ?? idx + 1;
                  const transfersLeft = row.transfersLeft ?? 0;
                  const usedTransfers = Math.max(0, 160 - transfersLeft);

                  const efficiency =
                    usedTransfers > 0
                      ? (row.points / usedTransfers).toFixed(2)
                      : "–";

                  const efficiencyNum = Number(efficiency);

                  // 🔥 Correct movement logic
                  const key = row.name.toLowerCase().trim();
                  const prevRank = prevRanks[key];

                  const movement =
                    prevRank !== undefined ? prevRank - rank : 0;

                  return (
                    <tr
                      key={row.name + idx}
                      className="border-b border-white/10 hover:bg-white/5 transition"
                    >
                      {/* Rank */}
                      <td
                        className={`px-1.5 py-2 w-[45px] border-l-4 ${
                          rank <= 3
                            ? "border-green-400"
                            : rank >= 6
                            ? "border-red-400"
                            : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-[2px]">
                          {rank === 1 && "🏆"}
                          {rank === 2 && "🥈"}
                          {rank === 3 && "🥉"}
                          <span>{rank}</span>
                        </div>
                      </td>

                      {/* Name + Arrow */}
                      <td className="px-1.5 py-2 font-medium text-white max-w-[90px] truncate">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{row.name}</span>

                          {movement > 0 && (
                            <span className="text-green-400 text-xs">⬆</span>
                          )}

                          {movement < 0 && (
                            <span className="text-red-400 text-xs">⬇</span>
                          )}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="px-1.5 py-2 text-center">
                        {row.points.toLocaleString("en-IN")}
                      </td>

                      {/* Last Match */}
                      <td className="px-1.5 py-2 text-center">
                        {row.lastMatchPoints || "-"}
                      </td>

                      {/* Transfers */}
                      <td className="px-1.5 py-2 text-center">
                        {transfersLeft}
                      </td>

                      {/* Boosters */}
                      <td className="px-1.5 py-2 text-center">
                        {row.boostersUsed ?? "-"}
                      </td>

                      {/* Efficiency */}
                      <td
                        className={`px-1.5 py-2 text-center font-semibold ${
                          efficiency === "–"
                            ? "text-slate-400"
                            : efficiencyNum > 70
                            ? "text-green-400"
                            : efficiencyNum > 50
                            ? "text-yellow-400"
                            : "text-slate-400"
                        }`}
                      >
                        {efficiency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}