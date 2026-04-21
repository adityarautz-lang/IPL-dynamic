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
import { splitTeamName } from "../lib/utils";
import { getColor } from "../lib/utils/getColor";

type Leader = {
  rank?: number;
  name: string;
  points: number;
  matchId?: number;
};

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

export default function OverallChart({ data }: { data: Leader[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const list = Array.isArray(data) ? data : [];

  // 🔥 Sort DESCENDING by points
  const sortedData = [...list].sort(
    (a, b) => (b.points ?? 0) - (a.points ?? 0)
  );

  const safeData = sortedData.map((d, idx) => ({
    ...d,
    points: Number(d.points ?? 0),
    rank: idx + 1,
  }));

  // 🔥 Leader gap logic
  const maxPoints = safeData[0]?.points ?? 0;

  const enrichedData = safeData.map((d) => ({
    ...d,
    gap: maxPoints - d.points,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-cyan-500/10 blur-2xl pointer-events-none" />

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" />

      <div className="relative z-10 p-6 mb-4">
        <h2 className="text-2xl font-bold bg-linear-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
          🏆 Overall Leaderboard
        </h2>
        <p className="text-slate-400 text-sm">
          Who’s winning and who’s pretending
        </p>
      </div>

      <div className="w-full h-[340px] px-6 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={enrichedData}
            barCategoryGap="30%"
            barGap={4}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={<CustomXAxisTick isMobile={isMobile} />}
              height={110}
              interval={0}
            />

            <YAxis
              stroke="#475569"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              width={40}
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

            <Bar
              dataKey="points"
              radius={[10, 10, 0, 0]}
              barSize={36} // 🔥 thicker bars
              animationDuration={800}
            >
              {enrichedData.map((entry, index) => {
                const isLeader = entry.rank === 1;

                return (
                  <Cell
                    key={index}
                    fill={getColor(entry.name)}
                    style={{
                      filter: isLeader
                        ? "drop-shadow(0px 0px 20px rgba(34,197,94,0.9))"
                        : "none",
                      opacity: isLeader ? 1 : 0.85,
                    }}
                  />
                );
              })}

              {/* Points */}
              <LabelList
                dataKey="points"
                position="top"
                offset={6}
                style={{
                  fill: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              {/* Rank */}
              <LabelList
                dataKey="rank"
                position="insideTop"
                offset={14}
                style={{
                  fill: "#cbd5e1",
                  fontSize: 10,
                }}
              />

              {/* Gap */}
              <LabelList
                dataKey="gap"
                position="top"
                formatter={(value: any) => {
                  const num = Number(value ?? 0);
                  return num > 0 ? `-${num.toFixed(0)}` : "";
                }}
                style={{
                  fill: "#fbbf24",
                  fontSize: 10,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}