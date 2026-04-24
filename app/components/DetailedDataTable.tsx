"use client";

import type { Leader } from "../types";

export default function DetailedDataTable({
  data,
}: {
  data?: Leader[];
}) {
  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">📋 Detailed Leaderboard</h2>
        <p className="text-slate-400 text-sm">No data available.</p>
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

  return (
    <div className="p-2 sm:p-5">
      <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-5">
        Detailed Leaderboard
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] sm:text-[12px] text-left border-collapse">
          
          {/* Header */}
          <thead className="bg-white/10 text-slate-300">
            <tr>
              <th className="px-1 py-1.5 w-[42px]">Rk</th>
              <th className="px-1 py-1.5">Name</th>
              <th className="px-1 py-1.5 w-[75px] text-right">Pts</th>
              <th className="px-1 py-1.5 w-[60px] text-right">LM</th>
              <th className="px-1 py-1.5 w-[55px] text-right">Tr</th>
              <th className="px-1 py-1.5 w-[55px] text-right">Bst</th>
              <th className="px-1 py-1.5 w-[65px] text-right">Eff</th>
            </tr>
          </thead>

          {/* Body */}
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

              return (
                <tr
                  key={row.name + idx}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  {/* Rank */}
                  <td
                    className={`px-1 py-1.5 border-l-4 ${
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

                  {/* Name */}
                  <td className="px-1 py-1.5 font-medium text-white max-w-[110px] truncate">
                    {row.name}
                  </td>

                  {/* Total Points */}
                  <td className="px-1 py-1.5 text-right whitespace-nowrap">
                    {row.points.toLocaleString("en-IN")}
                  </td>

                  {/* Last Match */}
                  <td className="px-1 py-1.5 text-right whitespace-nowrap">
                    {row.lastMatchPoints || "-"}
                  </td>

                  {/* Transfers */}
                  <td className="px-1 py-1.5 text-right whitespace-nowrap">
                    {transfersLeft}
                  </td>

                  {/* Boosters */}
                  <td className="px-1 py-1.5 text-right whitespace-nowrap">
                    {row.boostersUsed ?? "-"}
                  </td>

                  {/* Efficiency */}
                  <td
                    className={`px-1 py-1.5 text-right font-semibold whitespace-nowrap ${
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
  );
}