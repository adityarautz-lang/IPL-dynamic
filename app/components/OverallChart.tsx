"use client";

import {
  useEffect,
  useState,
} from "react";

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

export default function OverallChart({
  data,
}: {
  data?: Leader[];
}) {
  const [isMobile, setIsMobile] =
    useState(false);

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
  // 🔢 Formatter
  // =====================================
  const formatNumber = (
    num: number
  ) =>
    Math.round(num).toLocaleString(
      "en-IN"
    );

  const list = Array.isArray(data)
    ? data
    : [];

  if (!list.length) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">
          🏆 Overall
          Leaderboard
        </h2>

        <p className="text-slate-400 text-sm">
          No leaderboard data
          available.
        </p>
      </div>
    );
  }

  // =====================================
  // 🧠 Sort
  // =====================================
  const sortedData = [...list]
    .map((d) => ({
      ...d,

      points: Number(
        d.points ?? 0
      ),
    }))
    .sort(
      (a, b) =>
        b.points - a.points
    );

  const enrichedData =
    sortedData.map(
      (d, idx) => ({
        ...d,

        rank: idx + 1,
      })
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
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
          LEADERBOARD
        </div>

        <h2 className="text-xl sm:text-3xl font-black leading-none bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
          🏆 Overall
          Leaderboard
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm mt-3">
          Who’s winning and
          who’s pretending
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
              data={enrichedData}
              margin={{
                top: 20,
                right: 10,
                left: -10,
                bottom:
                  isMobile
                    ? 35
                    : 40,
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
                {enrichedData.map(
                  (
                    entry,
                    index
                  ) => {
                    const color =
                      getColor(
                        entry.name
                      );

                    return (
                      <linearGradient
                        key={index}
                        id={`overall-gradient-${index}`}
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
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
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
                    ? 45
                    : 50
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
                tick={{
                  fill:
                    "#ffffff",

                  fontSize: 10,
                }}
                width={40}
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
                animationDuration={
                  600
                }
              >
                {enrichedData.map(
                  (
                    entry,
                    index
                  ) => {
                    const isLeader =
                      entry.rank ===
                      1;

                    return (
                      <Cell
                        key={index}
                        fill={`url(#overall-gradient-${index})`}
                        stroke={getColor(
                          entry.name
                        )}
                        strokeOpacity={
                          0.35
                        }
                        style={{
                          filter:
                            isLeader
                              ? "drop-shadow(0px 0px 18px rgba(34,197,94,0.55))"
                              : "drop-shadow(0px 0px 10px rgba(255,255,255,0.06))",

                          opacity:
                            isLeader
                              ? 1
                              : 0.9,
                        }}
                      />
                    );
                  }
                )}

                {/* =====================================
                    POINT LABELS
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
                        ? y - 10
                        : y - 16;

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
                        transform={`rotate(-10, ${cx}, ${cy})`}
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

                {/* =====================================
                    RANK LABELS
                ===================================== */}
                <LabelList
                  dataKey="rank"
                  position="insideTop"
                  style={{
                    fill:
                      "#cbd5e1",

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