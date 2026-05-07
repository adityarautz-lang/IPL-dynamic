"use client";

import { useEffect, useMemo, useState } from "react";
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

import type { Leader } from "../types";

// =====================================
// 🎨 Stable color generator
// =====================================
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
}: {
  data?: Leader[];
}) {
  const [isMobile, setIsMobile] = useState(false);

  // =====================================
  // 📱 Responsive detection
  // =====================================
  useEffect(() => {
    const update = () =>
      setIsMobile(window.innerWidth < 640);

    update();

    window.addEventListener("resize", update);

    return () =>
      window.removeEventListener(
        "resize",
        update
      );
  }, []);

  // =====================================
  // 🔢 Safe formatter
  // =====================================
  const formatNumber = (num: number) =>
    Math.round(num).toLocaleString("en-IN");

  // =====================================
  // 🧠 Safe array
  // =====================================
  const list = Array.isArray(data)
    ? data
    : [];

  // =====================================
  // ❌ Empty state
  // =====================================
  if (!list.length) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">
          📊 Current Match Performance
        </h2>

        <p className="text-slate-400 text-sm">
          No match data available.
        </p>
      </div>
    );
  }

  // =====================================
  // 🧠 Memoized chart processing
  // =====================================
  const chartData = useMemo(() => {
    const matchData = list.filter(
      (p) =>
        typeof p.lastMatchPoints ===
          "number" &&
        p.lastMatchPoints > 0
    );

    const source =
      matchData.length > 0
        ? matchData
        : list;

    return source
      .map((p) => ({
        name: p.name,

        points:
          typeof p.lastMatchPoints ===
            "number" &&
          p.lastMatchPoints > 0
            ? p.lastMatchPoints
            : Number(p.points ?? 0),
      }))
      .filter((p) => p.points > 0)
      .sort((a, b) => b.points - a.points);
  }, [list]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
    >
      {/* =====================================
          🏷 Header
      ===================================== */}
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-cyan-300">
          📊 Current Match Score
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Runs, regrets & questionable decisions
        </p>
      </div>

      {/* =====================================
          📊 Chart
      ===================================== */}
      <div className="w-full px-2 sm:px-4">
        <div className="h-[240px] sm:h-[300px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 24,
                right: 10,
                left: -10,
                bottom: isMobile
                  ? 40
                  : 55,
              }}
              barCategoryGap={
                isMobile
                  ? "12%"
                  : "20%"
              }
            >
              {/* =====================================
                  Grid
              ===================================== */}
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.08)"
              />

              {/* =====================================
                  X Axis
              ===================================== */}
              <XAxis
                dataKey="name"
                stroke="#ffffff"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={
                  isMobile
                    ? 48
                    : 60
                }
                tick={{
                  fill: "#ffffff",
                  fontSize: isMobile
                    ? 9
                    : 11,
                }}
              />

              {/* =====================================
                  Y Axis
              ===================================== */}
              <YAxis
                stroke="#ffffff"
                width={42}
                tick={{
                  fill: "#ffffff",
                  fontSize: 10,
                }}
                tickFormatter={(value) =>
                  formatNumber(
                    Number(value)
                  )
                }
              />

              {/* =====================================
                  Tooltip
              ===================================== */}
              <Tooltip
                cursor={{
                  fill:
                    "rgba(255,255,255,0.05)",
                }}
                contentStyle={{
                  background:
                    "rgba(2,6,23,0.95)",

                  border:
                    "1px solid rgba(148,163,184,0.2)",

                  borderRadius: "10px",

                  fontSize: "12px",
                }}
                formatter={(value) =>
                  formatNumber(
                    Number(value)
                  )
                }
              />

              {/* =====================================
                  Bars
              ===================================== */}
              <Bar
                dataKey="points"
                radius={[8, 8, 0, 0]}
                barSize={
                  isMobile
                    ? 20
                    : 30
                }
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getRandomColor(
                      entry.name
                    )}
                  />
                ))}

                {/* =====================================
                    Labels
                ===================================== */}
                <LabelList
                  dataKey="points"
                  content={(
                    props: any
                  ) => {
                    const {
                      x,
                      y,
                      width,
                      value,
                    } = props;

                    const cx =
                      x + width / 2;

                    const cy =
                      isMobile
                        ? y - 8
                        : y - 10;

                    return (
                      <text
                        x={cx}
                        y={cy}
                        fill="rgba(255,255,255,0.92)"
                        fontSize={
                          isMobile
                            ? 9
                            : 12
                        }
                        fontWeight={600}
                        textAnchor="middle"
                      >
                        {formatNumber(
                          Number(value)
                        )}
                      </text>
                    );
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