"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import type { OverallChartItem } from "../types";

interface PointDifferencesProps {
  data: OverallChartItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TeamAxisTick = (props: any) => {
  const { x, y, payload, isMobile } = props;

  if (isMobile) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          transform="rotate(-90)"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#94a3b8"
          fontSize={10}
        >
          {payload.value}
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-4}
        textAnchor="end"
        dominantBaseline="central"
        fill="#94a3b8"
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default function PointDifferences({ data }: PointDifferencesProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="title">📊 Point Differences</h2>
        <p className="text-slate-400 text-sm">No data available.</p>
      </div>
    );
  }

  // ✅ Sort data
  const sortedData = [...data].sort((a, b) => b.points - a.points);

  const differences = sortedData.slice(0, -1).map((team, index) => {
    const nextTeam = sortedData[index + 1];
    const diff = team.points - nextTeam.points;

    return {
      team: team.name,
      difference: diff,
      vs: nextTeam.name,
    };
  });
  const chartHeight = isMobile
    ? Math.max(420, differences.length * 76)
    : 320;

  // 🔥 Find biggest gap
  const maxDiff = Math.max(...differences.map((d) => d.difference));

  // 🎨 Dynamic color logic
  const getColor = (value: number) => {
    if (value === maxDiff) return "#F43F5E"; // highlight biggest gap (rose)
    if (value > 50) return "#F59E0B"; // big gap
    if (value > 20) return "#22C55E"; // medium
    return "#06B6D4"; // small
  };

  // 😈 Roast generator
  const roast = (team: string, vs: string, diff: number) => {
    if (diff > 80)
      return `${vs} got absolutely demolished by ${team}. This wasn’t a contest.`;
    if (diff > 40) return `${vs} tried... but ${team} clearly didn’t notice.`;
    if (diff > 10) return `${team} stays ahead. ${vs} is... participating.`;
    return `${vs} is breathing down ${team}'s neck. Finally some competition.`;
  };

  return (
    <div>
      <div className="relative z-10 p-6">
        <h2 className="text-2xl font-bold bg-linear-to-r from-rose-300 via-amber-300 to-cyan-300 bg-clip-text text-transparent">
          📊 Point Differences
        </h2>
        <p className="text-slate-400 text-sm">
          Every gap, chase, and tiny little panic zone
        </p>
      </div>

      <div className="min-w-0 w-full p-0" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={differences}
            layout="vertical"
            margin={{
              top: isMobile ? 16 : 0,
              right: 56,
              left: isMobile ? 40 : 96,
              bottom: isMobile ? 16 : 0,
            }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <YAxis
              type="category"
              dataKey="team"
              axisLine={false}
              tickLine={false}
              tick={<TeamAxisTick isMobile={isMobile} />}
              width={isMobile ? 48 : 100}
            />

            {/* 😈 Roast Tooltip */}
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              content={({ payload }) => {
                if (!payload || !payload.length) return null;

                const data = payload[0].payload;

                return (
                  <div className="bg-slate-900/90 border border-white/10 p-3 rounded-lg text-sm text-white shadow-xl max-w-xs">
                    <p className="font-semibold mb-1">
                      {data.team} vs {data.vs}
                    </p>
                    <p className="text-slate-300 text-xs">
                      {roast(data.team, data.vs, data.difference)}
                    </p>
                  </div>
                );
              }}
            />

            <Bar
              dataKey="difference"
              radius={[0, 8, 8, 0]}
              barSize={20}
              animationDuration={800}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(props: any) => {
                const { x, y, width, value } = props;

                return (
                  <text
                    x={x + width + 6}
                    y={y + 14}
                    fill="#e2e8f0"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
                  </text>
                );
              }}
            >
              {differences.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.difference)}
                  style={{
                    filter:
                      entry.difference === maxDiff
                        ? "drop-shadow(0 0 10px rgba(244,63,94,0.6))"
                        : "none",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
