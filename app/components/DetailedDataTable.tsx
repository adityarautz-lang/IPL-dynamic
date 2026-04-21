"use client";

import type { Leader } from "../types"; // ✅ FIX

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
              const transfersLeft = Number(row.transfersLeft ?? 0);
              const usedTransfers = 160 - transfersLeft;

              const efficiency =
                usedTransfers > 0
                  ? (row.points! / usedTransfers).toFixed(2)
                  : "–";

              return (
                <tr
                  key={idx}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">{row.rank ?? idx + 1}</td>

                  <td className="px-4 py-3 font-medium text-white">
                    {row.name}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.points?.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.lastMatchPoints ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {transfersLeft}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.boostersUsed ?? "-"}
                  </td>

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