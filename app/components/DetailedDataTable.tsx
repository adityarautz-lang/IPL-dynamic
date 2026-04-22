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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📋 Detailed Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-white/10 text-slate-300">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-center">Total Points</th>
              <th className="px-4 py-3 text-center">Last Match</th>
              <th className="px-4 py-3 text-center">Transfers</th>
              <th className="px-4 py-3 text-center">Boosters</th>
              <th className="px-4 py-3 text-center">EFF</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((row, idx) => {
              const rank = row.rank ?? idx + 1;
              const previousRank = row.previousRank;
              const movement = row.movement;

              const transfersLeft = Number(row.transfersLeft ?? 0);
              const usedTransfers = 160 - transfersLeft;

              const efficiency =
                usedTransfers > 0
                  ? (Number(row.points ?? 0) / usedTransfers).toFixed(2)
                  : "–";

              return (
                <tr
                  key={idx}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  {/* Rank + Border + Movement */}
                  <td
                    className={`px-4 py-3 border-l-4
                      ${
                        rank <= 3
                          ? "border-green-400"
                          : rank >= 6
                          ? "border-red-400"
                          : "border-transparent"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {/* Trophy */}
                      {rank === 1 && "🏆"}
                      {rank === 2 && "🥈"}
                      {rank === 3 && "🥉"}

                      {/* Rank number */}
                      <span>{rank}</span>

                      {/* Movement arrow */}
                      {movement === "up" && (
                        <span className="text-green-400 text-xs">⬆️</span>
                      )}
                      {movement === "down" && (
                        <span className="text-red-400 text-xs">⬇️</span>
                      )}
                      {movement === "same" && (
                        <span className="text-slate-400 text-xs">➡️</span>
                      )}

                      {/* Optional delta */}
                      {previousRank && (
                        <span className="text-xs text-slate-400">
                          ({previousRank - rank > 0 ? "+" : ""}
                          {previousRank - rank})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-medium text-white">
                    {row.name}
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3 text-center">
                    {Number(row.points ?? 0).toLocaleString("en-IN")}
                  </td>

                  {/* Last Match */}
                  <td className="px-4 py-3 text-center">
                    {row.lastMatchPoints ?? "-"}
                  </td>

                  {/* Transfers */}
                  <td className="px-4 py-3 text-center">
                    {transfersLeft}
                  </td>

                  {/* Boosters */}
                  <td className="px-4 py-3 text-center">
                    {row.boostersUsed ?? "-"}
                  </td>

                  {/* Efficiency */}
                  <td
                    className={`px-4 py-3 text-center font-semibold ${
                      Number(efficiency) > 70
                        ? "text-green-400"
                        : Number(efficiency) > 50
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