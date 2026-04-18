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
  LabelList,
  Cell,
} from "recharts";
import type { OverallChartItem } from "../types";
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

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
];

export default function OverallChart({ data }: { data: OverallChartItem[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* glow background */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-cyan-500/10 blur-2xl pointer-events-none" />

      {/* shimmer */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" />

      <div className="relative z-10 p-6 mb-4">
        <h2 className="text-2xl font-bold bg-linear-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
          🏆 Overall Leaderboard
        </h2>
        <p className="text-slate-400 text-sm">
          Who’s winning and who’s pretending
        </p>
      </div>

      <div style={{ height: "320px", width: "95%", margin: "0 auto" }}>
        <ResponsiveContainer>
          <BarChart data={data}>
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
              animationDuration={1000}
            >
              {data.map((entry, index) => {
                const isLeader = entry.rank === 1;

                return (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300"
                    style={{
                      filter: isLeader
                        ? "drop-shadow(0px 0px 12px rgba(34,197,94,0.7))"
                        : "none",
                      opacity: isLeader ? 1 : 0.85,
                    }}
                  />
                );
              })}

              {/* Points label */}
              <LabelList
                dataKey="points"
                position="top"
                style={{
                  fill: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              {/* Rank inside bar */}
              <LabelList
                dataKey="rank"
                position="insideTop"
                offset={12}
                style={{
                  fill: "#cbd5e1",
                  fontSize: 10,
                  fontWeight: 500,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
