"use client";

import { motion } from "framer-motion";
import type { DashboardData, DailyChartRow } from "../types";

const formatNumber = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
};

const formatUpdatedAt = (value?: string) => {
  if (!value) return "Manual data";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const getDailyTeams = (rows: DailyChartRow[]) => {
  const teams = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key !== "day") teams.add(key);
    });
  });

  return Array.from(teams);
};

export default function DetailedDataTable({ data }: { data: DashboardData }) {
  const sortedOverall = [...data.overall].sort((a, b) => a.rank - b.rank);
  const teams = getDailyTeams(data.daily);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-emerald-500/10 blur-2xl" />
      <div className="absolute inset-0 opacity-20 animate-shimmer" />

      <div className="relative z-10 p-6">
        <h2 className="text-3xl font-bold bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
          📋 Detailed Data
        </h2>
        <p className="text-slate-400 mt-2">
          {data.source === "live-snapshot" ? "Live snapshot" : "Manual data"} ·{" "}
          Updated {formatUpdatedAt(data.updatedAt)}
        </p>
      </div>

      <div className="relative z-10 space-y-8 p-0 lg:p-6 lg:pt-0">
        <section>
          <div className="px-4 pb-3 lg:px-0">
            <h3 className="text-sm font-semibold text-white">
              Overall Leaderboard Details
            </h3>
            <p className="text-xs text-slate-400">
              Rank, points, movement, transfer context, and latest match score.
            </p>
          </div>

          <div className="overflow-x-auto border-y border-white/10 lg:rounded-lg lg:border">
            <table className="min-w-[980px] w-full border-collapse text-xs">
              <thead className="bg-white/10 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Rank</th>
                  <th className="px-3 py-2 text-left font-medium">Team</th>
                  <th className="px-3 py-2 text-right font-medium">Points</th>
                  <th className="px-3 py-2 text-right font-medium">
                    Previous
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Movement
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Gap Next
                  </th>
                  <th className="px-3 py-2 text-right font-medium">Gap %</th>
                  <th className="px-3 py-2 text-right font-medium">
                    Transfers
                  </th>
                  <th className="px-3 py-2 text-right font-medium">Boost</th>
                  <th className="px-3 py-2 text-right font-medium">Eff</th>
                  <th className="px-3 py-2 text-right font-medium">Last</th>
                </tr>
              </thead>
              <tbody>
                {sortedOverall.map((row) => (
                  <tr
                    key={row.name}
                    className="border-t border-white/10 text-slate-200"
                  >
                    <td className="px-3 py-2 font-semibold">{row.rank}</td>
                    <td className="px-3 py-2 font-medium text-white">
                      {row.name}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNumber(row.points)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNumber(row.previousPoints)}
                    </td>
                    <td className="px-3 py-2 text-right capitalize">
                      {row.movement ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNumber(row.gapToNext)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {typeof row.gapPercent === "number"
                        ? row.gapPercent.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.transfersLeft ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.boostersUsed ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {typeof row.efficiency === "number"
                        ? row.efficiency.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNumber(row.lastMatchPoints)}
                      {row.isLastMatchLeader ? (
                        <span className="ml-1">🏆</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="px-4 pb-3 lg:px-0">
            <h3 className="text-sm font-semibold text-white">
              Match-by-Match Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Full daily rows from the API, including the latest live update.
            </p>
          </div>

          <div className="overflow-x-auto border-y border-white/10 lg:rounded-lg lg:border">
            <table className="min-w-[980px] w-full border-collapse text-xs">
              <thead className="bg-white/10 text-slate-300">
                <tr>
                  <th className="sticky left-0 bg-slate-900 px-3 py-2 text-left font-medium">
                    Match
                  </th>
                  {teams.map((team) => (
                    <th
                      key={team}
                      className="px-3 py-2 text-right font-medium whitespace-nowrap"
                    >
                      {team}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.daily.map((row) => (
                  <tr
                    key={String(row.day)}
                    className="border-t border-white/10 text-slate-200"
                  >
                    <td className="sticky left-0 bg-slate-950 px-3 py-2 font-semibold text-white">
                      {row.day}
                    </td>
                    {teams.map((team) => (
                      <td key={team} className="px-3 py-2 text-right">
                        {formatNumber(Number(row[team] ?? 0))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </motion.section>
  );
}
