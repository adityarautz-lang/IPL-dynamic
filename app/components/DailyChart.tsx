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
const getRandomColor = (
  seed: string
) => {
  let hash = 0;

  for (
    let i = 0;
    i < seed.length;
    i++
  ) {
    hash =
      seed.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  const hue =
    Math.abs(hash) % 360;

  return `hsl(${hue}, 75%, 60%)`;
};

export default function DailyChart({
  data,
}: {
  data?: Leader[];
}) {
  const [isMobile, setIsMobile] =
    useState(false);

  // =====================================
  // 📱 Responsive detection
  // =====================================
  useEffect(() => {
    const update = () =>
      setIsMobile(
        window.innerWidth < 640
      );

    update();

    window.addEventListener(
      "resize",
      update
    );

    return () =>
      window.removeEventListener(
        "resize",
        update
      );
  }, []);

  // =====================================
  // 🔢 Safe formatter
  // =====================================
  const formatNumber = (
    num: number
  ) =>
    Math.round(num).toLocaleString(
      "en-IN"
    );

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
          📊 Current Match
          Performance
        </h2>

        <p className="text-slate-400 text-sm">
          No match data
          available.
        </p>
      </div>
    );
  }

  // =====================================
  // 🧠 Memoized chart processing
  // =====================================
  const chartData = useMemo(() => {
    const matchData =
      list.filter(
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
            : Number(
                p.points ?? 0
              ),
      }))
      .filter(
        (p) => p.points > 0
      )
      .sort(
        (a, b) =>
          b.points - a.points
      );
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
      className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)]"
    >
      {/* INNER GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_55%)] pointer-events-none" />

      {/* EDGE LIGHT */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/[0.03] pointer-events-none" />

      {/* =====================================
          🏷 Header
      ===================================== */}
      <div className="relative z-10 p-4 sm:p-6">
        <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
          LIVE MATCH
        </div>

        <h2 className="text-xl sm:text-3xl font-black leading-none bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
          📊 Current Match
          Score
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm mt-3">
          Runs, regrets &
          questionable
          decisions
        </p>
      </div>

      {/* =====================================
          📊 Chart
      ===================================== */}
      <div className="relative w-full px-2 sm:px-4">
        {/* INNER CHART GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.04),transparent_60%)] pointer-events-none" />

        <div className="h-[240px] sm:h-[300px] relative z-10">
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
                bottom:
                  isMobile
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
                  Gradients
              ===================================== */}
              <defs>
                {chartData.map(
                  (
                    entry,
                    index
                  ) => {
                    const color =
                      getRandomColor(
                        entry.name
                      );

                    return (
                      <linearGradient
                        key={index}
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            color
                          }
                          stopOpacity={
                            1
                          }
                        />

                        <stop
                          offset="100%"
                          stopColor={
                            color
                          }
                          stopOpacity={
                            0.35
                          }
                        />
                      </linearGradient>
                    );
                  }
                )}
              </defs>

              {/* =====================================
                  Grid
              ===================================== */}
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
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
                  fontSize:
                    isMobile
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
                tickFormatter={(
                  value
                ) =>
                  formatNumber(
                    Number(
                      value
                    )
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
                    "1px solid rgba(34,211,238,0.15)",

                  borderRadius:
                    "16px",

                  backdropFilter:
                    "blur(12px)",

                  fontSize:
                    "12px",
                }}
                formatter={(
                  value
                ) =>
                  formatNumber(
                    Number(
                      value
                    )
                  )
                }
              />

              {/* =====================================
                  Bars
              ===================================== */}
              <Bar
                dataKey="points"
                radius={[
                  10, 10, 0, 0,
                ]}
                barSize={
                  isMobile
                    ? 20
                    : 30
                }
                isAnimationActive={
                  false
                }
              >
                {chartData.map(
                  (
                    entry,
                    index
                  ) => (
                    <Cell
                      key={
                        entry.name
                      }
                      fill={`url(#gradient-${index})`}
                      stroke={getRandomColor(
                        entry.name
                      )}
                      strokeOpacity={
                        0.35
                      }
                      style={{
                        filter:
                          "drop-shadow(0 0 12px rgba(255,255,255,0.08))",
                      }}
                    />
                  )
                )}

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
                      x +
                      width / 2;

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
                        fontWeight={
                          700
                        }
                        textAnchor="middle"
                      >
                        {formatNumber(
                          Number(
                            value
                          )
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