"use client";

import { motion } from "framer-motion";

type Leader = {
  rank?: number;
  name: string;
  points: number;
  lastMatchPoints?: number;
  transfersLeft?: number;
  boostersUsed?: string | null;
};

export default function DetailedDataTable({ data }: { data: Leader[] }) {
  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">📋 Detailed Table</h2>
        <p className="text-slate-400 text-sm">No data available.</p>
      </div>
    );
  }

  // sort by rank or points
  const sorted = [...list].sort(
    (a, b) => (a.rank ?? 999) - (b.rank ?? 999)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h2 className="text-2xl font-bold mb-4">📋 Detailed Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/10 text-slate-300">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Name</th>
              <th className="p-3">Total Points</th>
              <th className="p-3">Last Match</th>
              <th className="p-3">Transfers</th>
              <th className="p-3">Boosters</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((row, index) => (
              <tr
                key={row.name}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="p-3 font-semibold">
                  {row.rank ?? index + 1}
                </td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.points}</td>
                <td className="p-3">
                  {row.lastMatchPoints ?? "-"}
                </td>
                <td className="p-3">
                  {row.transfersLeft ?? "-"}
                </td>
                <td className="p-3">
                  {row.boostersUsed ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}