"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  LabelList,
} from "recharts";
import type { OverallChartItem } from "../types";

interface PointDifferencesProps {
  data: OverallChartItem[];
}

export default function PointDifferences({ data }: PointDifferencesProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  // ✅ ALWAYS run hooks (even if data is empty)
  const { differences, maxDiff } = useMemo(() => {
    if (!data || data.length < 2) {
      return { differences: [], maxDiff: 0 };
    }

    const safeSorted = [...data]
      .map((d) => ({
        ...d,
        points: Number(d.points ?? 0),
      }))
      .sort((a, b) => b.points - a.points);

    const diffs = safeSorted.slice(0, -1).map((team, index) => {
      const nextTeam = safeSorted[index + 1];

      return {
        team: team.name,
        difference: team.points - (nextTeam?.points ?? 0),
        vs: nextTeam?.name ?? "—",
      };
    });

    const max =
      diffs.length > 0 ? Math.max(...diffs.map((d) => d.difference)) : 0;

    return { differences: diffs, maxDiff: max };
  }, [data]);

  const chartHeight = isMobile ? Math.max(420, differences.length * 76) : 320;

  // ✅ Now safe to early return AFTER hooks
  if (!data || data.length < 2) {
    return (
      <div className="glass-card p-6">
        <h2 className="title">📊 Point Differences</h2>
        <p className="text-slate-400 text-sm">
          Not enough data to compare teams.
        </p>
      </div>
    );
  }

  const getColor = (value: number) => {
    if (value === maxDiff && maxDiff > 0) return "#22C55E";
    if (value > 1000) return "#F59E0B";
    if (value > 500) return "#06B6D4";
    if (value > 200) return "#06B6D4";
    return "#F43F5E";
  };

  return (
    <div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">📊 Point Differences</h2>
      </div>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={differences} layout="vertical" barCategoryGap="20%">
            <XAxis type="number" />
            <YAxis type="category" dataKey="team" />

            <Tooltip />

            <Bar
              dataKey="difference"
              radius={[0, 8, 8, 0]}
              barSize={20}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {differences.map((entry) => (
                <Cell
                  key={entry.team}
                  fill={getColor(entry.difference)}
                  style={{
                    transition: "all 0.6s ease",
                    filter:
                      entry.difference === maxDiff && maxDiff > 0
                        ? "drop-shadow(0 0 12px rgba(244,63,94,0.8))"
                        : "none",
                  }}
                />
              ))}
              <LabelList
                dataKey="difference"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const num = Number(value ?? 0);
                  const isNegative = num < 0;

                  return (
                    <text
                      x={isNegative ? x - 6 : x + width + 6}
                      y={y + height / 2}
                      textAnchor={isNegative ? "end" : "start"}
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {num > 0 ? `+${num}` : num}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
