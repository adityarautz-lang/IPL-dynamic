"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DashboardData, DailyChartRow } from "../types";

const TEAM_ALIASES: Record<string, string> = {
  "Vijay Swami": "VATVAGHOOL XI",
};

const normalizeRow = (row: DailyChartRow): DailyChartRow => {
  const normalized: DailyChartRow = { day: row.day };

  Object.entries(row).forEach(([key, value]) => {
    if (key === "day") return;

    const canonical = TEAM_ALIASES[key] || key;

    normalized[canonical] =
      Number(normalized[canonical] ?? 0) + Number(value ?? 0);
  });

  return normalized;
};
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

export default function DetailedDataTable({ data }: { data: DashboardData }) {
  const prevMatchesRef = useRef<number[]>([]);
  const [newMatchId, setNewMatchId] = useState<number | null>(null);
  const getMatchNum = (day: string) => Number(day.replace("Match ", "")) || 0;
  const historicalRows = (() => {
    const map = new Map<number, DailyChartRow>();

    data.daily.forEach((row) => {
      if (!row.day || row.day === "Live Update") return;

      const matchNum = Number(row.day.replace("Match ", ""));

      // ❌ ignore invalid matches
      if (!Number.isFinite(matchNum) || matchNum <= 0) return;

      // ✅ normalize + dedupe (latest wins)
      map.set(matchNum, normalizeRow(row));
    });

    // ✅ convert to sorted array
    const sorted = Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, row]) => row);

    // ✅ enforce max 27 matches
    return sorted.slice(-27);
  })();
  const sortedOverall = [...data.overall].sort((a, b) => a.rank - b.rank);
  const sortedRows = historicalRows;

  useEffect(() => {
    const currentMatches = sortedRows.map((r) => getMatchNum(r.day));
    const prevMatches = prevMatchesRef.current;

    // find new match
    const newMatch = currentMatches.find((m) => !prevMatches.includes(m));

    if (newMatch) {
      setNewMatchId(newMatch);

      // clear highlight after animation
      setTimeout(() => setNewMatchId(null), 2000);
    }

    prevMatchesRef.current = currentMatches;
  }, [sortedRows]);

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
            <table className="min-w-245 w-full border-collapse text-xs">
              <thead className="bg-white/10 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Rank</th>
                  <th className="px-3 py-2 text-left font-medium">Team</th>
                  <th className="px-3 py-2 text-right font-medium">Points</th>
                  <th className="px-3 py-2 text-right font-medium">Previous</th>
                  <th className="px-3 py-2 text-right font-medium">Movement</th>
                  <th className="px-3 py-2 text-right font-medium">Gap Next</th>
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
                      {row.movement === "up" && (
                        <span className="text-green-400">⬆Up</span>
                      )}

                      {row.movement === "down" && (
                        <span className="text-red-400">⬇Down</span>
                      )}

                      {row.movement === "same" && (
                        <span className="text-slate-400">Same</span>
                      )}

                      {!row.movement && "-"}
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
      </div>
    </motion.section>
  );
}
