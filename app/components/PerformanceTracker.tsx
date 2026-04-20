"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Leader = {
  name: string;
  points: number;
};

interface PerformanceTrackerProps {
  data: Leader[];
}

export default function PerformanceTracker({ data }: PerformanceTrackerProps) {
  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">📈 Performance Tracker</h2>
        <p className="text-slate-400 text-sm">
          No performance data available.
        </p>
      </div>
    );
  }

  // ✅ Convert to chart-friendly format
  const chartData = list
    .map((p) => ({
      name: p.name,
      points: Number(p.points ?? 0),
    }))
    .sort((a, b) => b.points - a.points);

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
          Current leaderboard performance
        </p>
      </div>

      {/* ✅ FIXED height issue */}
      <div className="w-full h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              interval={0}
            />

            <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />

            <Tooltip
              contentStyle={{
                background: "rgba(2,6,23,0.95)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey="points"
              stroke="#6366F1"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}