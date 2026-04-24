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
import type { Leader } from "../types";

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
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">📊 Current Match Performance</h2>
        <p className="text-slate-400 text-sm">No match data available.</p>
      </div>
    );
  }

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
    .filter((p) => p.points > 0)
    .sort((a, b) => b.points - a.points);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-cyan-300">
          📊 Current Match Performance
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Runs, regrets, and questionable decisions
        </p>
      </div>

      {/* Chart */}
      <div className="w-full px-2 sm:px-4 pb-6">
        <div className="h-[240px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: isMobile ? 65 : 60, // ✅ ONLY CHANGE
              }}
              barCategoryGap={isMobile ? "10%" : "20%"}
            >
              <XAxis
                dataKey="name"
                stroke="#ffffff"
                tick={{
                  fill: "#ffffff",
                  fontSize: isMobile ? 9 : 11,
                }}
                interval={0}
                angle={isMobile ? -30 : -25}
textAnchor="end"
height={isMobile ? 70 : 75}
              />

              <YAxis
                stroke="#ffffff"
                tick={{ fill: "#ffffff", fontSize: 10 }}
                width={30}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(2,6,23,0.95)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "10px",
                }}
              />

              <Bar
                dataKey="points"
                radius={[8, 8, 0, 0]}
                barSize={isMobile ? 22 : 30}
              >
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
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 600,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}