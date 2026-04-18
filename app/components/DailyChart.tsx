"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const { x, y, payload, isMobile } = props;

  if (isMobile) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          transform="rotate(-90)"
          textAnchor="end"
          fill="#94a3b8"
          fontSize={10}
        >
          {payload.value}
        </text>
      </g>
    );
  }

  const lines = splitTeamName(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#94a3b8" fontSize={10}>
        {lines[0]}
      </text>
      {lines[1] && (
        <text y={14} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          {lines[1]}
        </text>
      )}
    </g>
  );
};

const getRandomColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 75%, 60%)`;
};

export default function DailyChart({
  data,
  matchId,
}: {
  data?: DailyChartRow;
  matchId?: number;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  if (!data)
    return (
      <div className="glass-card p-6">
        <h2 className="title">📊 Daily Match Performance</h2>
        <p className="text-slate-400 text-sm">No match data available.</p>
      </div>
    );

  const players = Object.keys(data).filter((k) => k !== "day");

  const chartData = players
    .map((player) => ({
      name: player,
      points: Number(data[player]),
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* glow layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 blur-2xl pointer-events-none" />

      {/* shimmer */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" />

      <div className="relative z-10 p-6 mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          📊 Match {matchId ?? "Latest"} Performance
        </h2>
        <p className="text-slate-400 text-sm">
          Individual chaos from match {matchId ?? "latest"}
        </p>
      </div>

      <div style={{ height: "320px", width: "95%", margin: "0 auto" }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={<CustomXAxisTick isMobile={isMobile} />}
              height={100}
              interval={0}
            />

            <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "rgba(2,6,23,0.95)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            />

            <Bar
              dataKey="points"
              radius={[10, 10, 0, 0]}
              animationDuration={900}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={getRandomColor(entry.name)}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}

              <LabelList
                dataKey="points"
                position="top"
                style={{
                  fill: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
