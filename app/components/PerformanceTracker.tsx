"use client";

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

const PLAYER_NAMES = [
  "Deccan Dominators",
  "Watapi",
  "SquadSeven9",
  "VATVAGHOOL XI",
  "RSAwesome 11",
];

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
];

const generateDummyData = (): DailyChartRow[] => {
  return Array.from({ length: 24 }, (_, index) => {
    const day = `Day ${index + 1}`;
    const row: DailyChartRow = { day };

    PLAYER_NAMES.forEach((name, playerIndex) => {
      const base = 30 + playerIndex * 6;
      const trend = (index + 1) * (1 + playerIndex * 0.08);
      const variance = Math.sin((index + 1) / 3 + playerIndex) * 4;
      row[name] = Math.max(10, Math.round(base + trend + variance));
    });

    return row;
  });
};

const dummyData = generateDummyData();

export default function PerformanceTracker() {
  const players = Object.keys(dummyData[0] || {}).filter(
    (key) => key !== "day",
  );

  return (
    <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-slate-700/20 via-slate-800/30 to-slate-900/40 shadow-2xl border border-white/10 backdrop-blur-2xl hover:border-white/20 hover:shadow-3xl hover:from-slate-700/30 hover:via-slate-800/40 hover:to-slate-900/50 transition-all duration-500">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent mb-1 tracking-wide">
            📈 Performance Tracker
          </h2>
          <p className="text-slate-400 text-sm">
            24-day trend analysis across all teams
          </p>
        </div>

        <div style={{ height: "380px" }}>
          <ResponsiveContainer>
            <LineChart data={dummyData}>
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "16px",
                  color: "#cbd5e1",
                  fontSize: "12px",
                }}
              />

              {players.map((player, index) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                  animationDuration={1200}
                  isAnimationActive={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
