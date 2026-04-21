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
import { splitTeamName } from "../lib/utils";
import type { Leader } from "../types"; // ✅ IMPORTANT FIX

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

export default function DailyChart({ data }: { data?: Leader[] }) {
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
      <div className="p-6">
        <h2 className="text-xl font-bold">📊 Current Match Performance</h2>
        <p className="text-slate-400 text-sm">No match data available.</p>
      </div>
    );
  }

  // ✅ SAFE fallback logic (never blank)
  const matchData = list.filter(
    (p) =>
      typeof p.lastMatchPoints === "number" &&
      p.lastMatchPoints > 0
  );

  const source = matchData.length > 0 ? matchData : list;

  const chartData = source
    .map((p) => ({
      name: p.name,
      points:
        typeof p.lastMatchPoints === "number" && p.lastMatchPoints > 0
          ? p.lastMatchPoints
          : Number(p.points ?? 0),
    }))
    .filter((p) => p.points > 0) // ✅ prevent empty bars
    .sort((a, b) => b.points - a.points);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-blue-500/10 blur-2xl pointer-events-none" />

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" />

      <div className="relative z-10 p-6 mb-4">
        <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          📊 Current Match Performance
        </h2>
      </div>

      {/* ✅ FIXED HEIGHT */}
      <div className="w-full h-[340px] px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
                    <XAxis
            dataKey="name"
            stroke="#475569"
            angle={-90}
            textAnchor="end"
            interval={0}
            height={140}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />

            <YAxis
              stroke="#475569"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "rgba(2,6,23,0.95)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            />

            <Bar dataKey="points" radius={[10, 10, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={getRandomColor(entry.name)}
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