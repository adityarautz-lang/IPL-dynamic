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
  CartesianGrid,
} from "recharts";
import { getColor } from "../lib/utils/getColor";
import type { Leader } from "../types";

export default function OverallChart({ data }: { data?: Leader[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ✅ Number formatter
  const formatNumber = (num: number) =>
    num.toLocaleString("en-IN");

  const list = Array.isArray(data) ? data : [];

  if (!list.length) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">🏆 Overall Leaderboard</h2>
        <p className="text-slate-400 text-sm">
          No leaderboard data available.
        </p>
      </div>
    );
  }

  const sortedData = [...list]
    .map((d) => ({
      ...d,
      points: Number(d.points ?? 0),
    }))
    .sort((a, b) => b.points - a.points);

  const enrichedData = sortedData.map((d, idx) => ({
    ...d,
    rank: idx + 1,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-emerald-300">
          🏆 Overall Leaderboard
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Who’s winning and who’s pretending
        </p>
      </div>

      {/* Chart */}
      <div className="w-full px-2 sm:px-4">
        <div className="h-[240px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={enrichedData}
              margin={{
                top: 20, // 🔥 slightly more space for labels
                right: 10,
                left: -10,
                bottom: isMobile ? 35 : 40,
              }}
              barCategoryGap={isMobile ? "12%" : "20%"}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#ffffff"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={isMobile ? 45 : 50}
                tick={{
                  fill: "#ffffff",
                  fontSize: isMobile ? 9 : 11,
                }}
              />

              <YAxis
                stroke="#ffffff"
                tick={{ fill: "#ffffff", fontSize: 10 }}
                width={40}
                tickFormatter={formatNumber}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(2,6,23,0.95)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "10px",
                }}
                formatter={(value: number) => formatNumber(value)}
              />

              <Bar
                dataKey="points"
                radius={[8, 8, 0, 0]}
                barSize={isMobile ? 20 : 30}
                animationDuration={600}
              >
                {enrichedData.map((entry, index) => {
                  const isLeader = entry.rank === 1;

                  return (
                    <Cell
                      key={index}
                      fill={getColor(entry.name)}
                      style={{
                        filter: isLeader
                          ? "drop-shadow(0px 0px 12px rgba(34,197,94,0.7))"
                          : "none",
                        opacity: isLeader ? 1 : 0.85,
                      }}
                    />
                  );
                })}

                {/* ✅ Points ABOVE bar but CENTERED */}
                <LabelList
                  dataKey="points"
                  content={(props: any) => {
                    const { x, y, width, value } = props;

                    return (
                      <text
                        x={x + width / 2} // ✅ true center
                        y={y - 6} // slightly above bar
                        fill="#fff"
                        fontSize={isMobile ? 10 : 12}
                        fontWeight={600}
                        textAnchor="middle"
                      >
                        {formatNumber(value)}
                      </text>
                    );
                  }}
                />

                {/* Rank */}
                <LabelList
                  dataKey="rank"
                  position="insideTop"
                  style={{
                    fill: "#cbd5e1",
                    fontSize: 9,
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