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

type Leader = {
  name: string;
  points: number;
  rank?: number;
};

interface PointDifferencesProps {
  data: Leader[];
}

export default function PointDifferences({ data }: PointDifferencesProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  // ✅ Always safe array
  const list = Array.isArray(data) ? data : [];

  const { differences, maxDiff } = useMemo(() => {
    if (list.length < 2) {
      return { differences: [], maxDiff: 0 };
    }

    const sorted = [...list]
      .map((d) => ({
        ...d,
        points: Number(d.points ?? 0),
      }))
      .sort((a, b) => b.points - a.points);

    const diffs = sorted.slice(0, -1).map((team, index) => {
      const nextTeam = sorted[index + 1];

      return {
        team: team.name,
        difference: team.points - (nextTeam?.points ?? 0),
        vs: nextTeam?.name ?? "—",
      };
    });

    const max =
      diffs.length > 0 ? Math.max(...diffs.map((d) => d.difference)) : 0;

    return { differences: diffs, maxDiff: max };
  }, [list]);

  const chartHeight = isMobile
    ? Math.max(420, differences.length * 76)
    : 320;

  if (list.length < 2) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">📊 Point Differences</h2>
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
        <h2 className="text-2xl font-bold text-white">
          📊 Point Differences
        </h2>
      </div>

      {/* ✅ FIXED chart container */}
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={differences} layout="vertical" barCategoryGap="20%">
            <XAxis type="number" stroke="#475569" />
            <YAxis
              type="category"
              dataKey="team"
              stroke="#475569"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <Tooltip
              contentStyle={{
                background: "rgba(2,6,23,0.95)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: "12px",
              }}
            />

            <Bar
              dataKey="difference"
              radius={[0, 8, 8, 0]}
              barSize={20}
              animationDuration={800}
            >
              {differences.map((entry) => (
                <Cell
                  key={entry.team}
                  fill={getColor(entry.difference)}
                  style={{
                    filter:
                      entry.difference === maxDiff && maxDiff > 0
                        ? "drop-shadow(0 0 12px rgba(34,197,94,0.7))"
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