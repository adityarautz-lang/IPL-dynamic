"use client";

import { useMemo } from "react";
import type { Leader } from "../types";

interface PointDifferencesProps {
  data?: Leader[];
}

export default function PointDifferences({ data }: PointDifferencesProps) {
  const list = Array.isArray(data) ? data : [];

  const { differences, maxGap } = useMemo(() => {
    if (list.length < 2) return { differences: [], maxGap: 0 };

    const sorted = [...list]
      .map((d) => ({
        ...d,
        points: Number(d.points ?? 0),
      }))
      .sort((a, b) => b.points - a.points);

    const diffs = sorted.slice(0, -1).map((team, index) => {
      const nextTeam = sorted[index + 1];

      return {
        rank: index + 1,
        team: team.name,
        difference: team.points - (nextTeam?.points ?? 0),
        vs: nextTeam?.name ?? "—",
      };
    });

    const max =
      diffs.length > 0 ? Math.max(...diffs.map((d) => d.difference)) : 0;

    return { differences: diffs, maxGap: max };
  }, [list]);

  if (list.length < 2) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Gap to Next Rival</h2>
        <p className="text-slate-400 text-sm">
          Not enough data to compare teams.
        </p>
      </div>
    );
  }

  const getTextColor = (gap: number) => {
    if (gap <= 50) return "text-green-400";
    if (gap <= 200) return "text-yellow-400";
    return "text-orange-400";
  };

  const getBgColor = (gap: number) => {
    if (gap <= 50) return "bg-green-500/10";
    if (gap <= 200) return "bg-yellow-500/10";
    return "bg-orange-500/10";
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Gap to Next Rival
        </h2>
        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
          LIVE
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {differences.map((item) => (
          <div
            key={item.team}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition hover:bg-white/5 ${getBgColor(
              item.difference
            )}`}
          >
            {/* Left */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">
                #{item.rank}
              </span>
              <span className="text-sm sm:text-base text-white font-medium">
                {item.team}
              </span>
              <span className="text-xs text-slate-400">
                vs {item.vs}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {item.difference === maxGap && maxGap > 0 && (
                <span className="text-sm">🔥</span>
              )}
              <span
                className={`text-sm sm:text-base font-semibold ${getTextColor(
                  item.difference
                )}`}
              >
                +{item.difference}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Close (&lt;50)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Medium (50–200)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Far (&gt;200)
        </span>
      </div>
    </div>
  );
}