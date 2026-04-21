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
  CartesianGrid,
} from "recharts";
import { splitTeamName } from "../lib/utils";

type Leader = {
  name: string;
  lastMatchPoints?: number;
  points?: number;
};

// IPL-style color palette (consistent, not random)
const TEAM_COLORS = [
  "#facc15", // yellow
  "#60a5fa", // blue
  "#34d399", // green
  "#fb7185", // red
  "#a78bfa", // purple
  "#f97316", // orange
  "#22c55e",
  "#ef4444",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomXAxisTick = (props: any) => {
  const { x, y, payload, isMobile } = props;

  if (isMobile) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          transform="rotate(-90)"
          textAnchor="end"
          fill="#cbd5f5"
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
      <text textAnchor="middle" fill="#cbd5f5" fontSize={11}>
        {lines[0]}
      </text>
      {lines[1] && (
        <text y={14} textAnchor="middle" fill="#cbd5f5" fontSize={11}>
          {lines[1]}
        </text>
      )}
    </g>
  );
};

export default function DailyChart({
  data,
  matchId,
}: {
  data?: Leader[];
  matchId?: number;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="p-6 bg-[#1e2a5a] rounded-xl">
        <h2 className="text-lg font-bold text-white">
          📊 Current Match Performance
        </h2>
        <p className="text-slate-300 text-sm">No match data available.</p>
      </div>
    );
  }

  const chartData = list
    .map((p) => ({
      name: p.name,
      points: Number(p.lastMatchPoints ?? p.points ?? 0),
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-[#1e2a5a] border border-[#2f3f85] shadow-lg overflow-hidden"
    >
      {/* IPL top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500" />

      {/* Header */}
      <div className="p-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
          <h2 className="text-xl font-bold text-white tracking-wide">
            Match {matchId ?? "Latest"} Performance
          </h2>
        </div>

        <p className="text-slate-300 text-sm mt-1">
          Individual performance breakdown
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-[320px] px-4 pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tick={<CustomXAxisTick isMobile={isMobile} />}
              height={100}
              interval={0}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#cbd5f5", fontSize: 11 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "#0f172a",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />

            <Bar
              dataKey="points"
              radius={[4, 4, 0, 0]}
              barSize={28}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={TEAM_COLORS[index % TEAM_COLORS.length]}
                  style={{
                    opacity: index === 0 ? 1 : 0.9,
                  }}
                />
              ))}

              <LabelList
                dataKey="points"
                position="top"
                style={{
                  fill: "#ffffff",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}