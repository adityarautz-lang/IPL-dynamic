"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { DailyChartRow } from "../types";
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

const getRandomColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 72%, 65%)`;
};

export default function DailyChart({
  data,
  matchId,
}: {
  data?: DailyChartRow;
  matchId?: number;
}) {
  if (!data)
    return (
      <div className="w-full p-6 rounded-3xl bg-linear-to-br from-slate-700/20 via-slate-800/30 to-slate-900/40 shadow-2xl border border-white/10 backdrop-blur-2xl">
        <div className="absolute inset-0 rounded-3xl bg-linear-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-1 tracking-wide">
            📊 Daily Match Performance
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            No match data available.
          </p>
        </div>
      </div>
    );

  const players = Object.keys(data).filter((k) => k !== "day");
  const chartData = players
    .map((player) => ({
      name: player,
      points: Number(data[player]),
    }))
    .sort((a, b) => b.points - a.points); // Sort from highest to lowest

  return (
    <div className="w-full p-6 rounded-3xl bg-linear-to-br from-slate-700/20 via-slate-800/30 to-slate-900/40 shadow-2xl border border-white/10 backdrop-blur-2xl hover:border-white/20 hover:shadow-3xl hover:from-slate-700/30 hover:via-slate-800/40 hover:to-slate-900/50 transition-all duration-500">
      <div className="absolute inset-0 rounded-3xl bg-linear-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-1 tracking-wide">
            📊 Match {matchId ?? "Latest"} Performance
          </h2>
          <p className="text-slate-400 text-sm">
            Individual player performance in match {matchId ?? "latest"}
          </p>
        </div>

        <div style={{ height: "320px", width: "95%", margin: "0 auto" }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
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
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#fff" }}
                formatter={(value, name, props) => {
                  if (name === "points") {
                    return [value, props.payload.name];
                  }
                  return [value, name];
                }}
              />

              <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={getRandomColor(entry.name)} />
                ))}
                <LabelList
                  dataKey="points"
                  position="top"
                  style={{ fill: "#ffffff", fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
