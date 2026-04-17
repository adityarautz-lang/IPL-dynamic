"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import type { OverallChartItem } from "../types";
import { splitTeamName } from "../lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const lines = splitTeamName(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="middle" fill="#cbd5e1" fontSize={10}>
        {lines[0]}
      </text>
      {lines[1] && (
        <text x={0} y={14} textAnchor="middle" fill="#cbd5e1" fontSize={10}>
          {lines[1]}
        </text>
      )}
    </g>
  );
};

const COLORS = [
  "#6366F1", // indigo
  "#22C55E", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#06B6D4", // cyan
  "#A855F7", // purple
];

export default function OverallChart({ data }: { data: OverallChartItem[] }) {
  return (
    <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-slate-700/20 via-slate-800/30 to-slate-900/40 shadow-2xl border border-white/10 backdrop-blur-2xl hover:border-white/20 hover:shadow-3xl hover:from-slate-700/30 hover:via-slate-800/40 hover:to-slate-900/50 transition-all duration-500">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent mb-1 tracking-wide">
            🏆 Overall Leaderboard
          </h2>
          <p className="text-slate-400 text-sm">
            Teams standings and cumulative points
          </p>
        </div>

        <div style={{ height: "320px", width: "95%", margin: "0 auto" }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={<CustomXAxisTick />}
                height={100}
                interval={0}
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
                formatter={(value, name, props) => {
                  if (name === "points" || name === "rank") {
                    return [value, name];
                  }
                  return [value, props.payload.name];
                }}
              />

              <Bar
                dataKey="points"
                radius={[8, 8, 0, 0]}
                animationDuration={1200}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}

                <LabelList
                  dataKey="rank"
                  position="top"
                  className="fill-slate-300 text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
