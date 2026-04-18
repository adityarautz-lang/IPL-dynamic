"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DailyChartRow } from "../types";

interface PerformanceTrackerProps {
  data: DailyChartRow[];
}

export default function PerformanceTracker({ data }: PerformanceTrackerProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="title">📈 Performance Tracker</h2>
        <p className="text-slate-400 text-sm">No performance data available.</p>
      </div>
    );
  }

  const players = Object.keys(data[0] || {}).filter((key) => key !== "day");

  const cumulativeData = data.reduce<DailyChartRow[]>((acc, row, index) => {
    const previous = acc[index - 1] ?? { day: "" };
    const cumulativeRow: DailyChartRow = { day: row.day };

    players.forEach((player) => {
      const current = Number(row[player]) || 0;
      const previousTotal = Number(previous[player]) || 0;
      cumulativeRow[player] = previousTotal + current;
    });

    acc.push(cumulativeRow);
    return acc;
  }, []);

  const COLORS = [
    "#6366F1",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#A855F7",
    "#EC4899",
    "#14B8A6",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden p-6"
    >
      {/* glow */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 via-transparent to-cyan-500/10 blur-2xl pointer-events-none" />

      {/* shimmer */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" />

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-bold bg-linear-to-r from-violet-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
          📈 Performance Tracker
        </h2>
        <p className="text-slate-400 text-sm">
          25-match chaos visualized beautifully
        </p>
      </div>

      <div className="min-w-0" style={{ height: "380px" }}>
        <ResponsiveContainer minWidth={0}>
          <LineChart data={cumulativeData}>
            <XAxis
              dataKey="day"
              stroke="#475569"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />

            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
              contentStyle={{
                background: "rgba(2,6,23,0.95)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            />

            <Legend
              wrapperStyle={{
                paddingTop: "16px",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            />

            {players.map((player, index) => {
              const color = COLORS[index % COLORS.length];

              return (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 6,
                    style: {
                      filter: `drop-shadow(0px 0px 8px ${color})`,
                    },
                  }}
                  animationDuration={1200}
                  style={{
                    filter: `drop-shadow(0px 0px 6px ${color}55)`,
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
