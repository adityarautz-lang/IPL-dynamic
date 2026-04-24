"use client";

import { useMemo } from "react";
import type { DashboardData } from "../types";
import { RoastDisplay } from "./RoastDisplay";

export default function Summary({ data }: { data?: DashboardData }) {
  const list = Array.isArray(data?.leaders) ? data.leaders : [];

  const stats = useMemo(() => {
    if (list.length === 0) return null;

    const topScore = Math.max(...list.map((p) => Number(p.points ?? 0)));
    const avgPoints = list.reduce((sum, p) => sum + Number(p.points ?? 0), 0) / list.length;

    return { total: list.length, topScore: topScore.toFixed(0), avg: avgPoints.toFixed(1) };
  }, [list]);

  return (
    <div className="space-y-4">
      {/* Compact stats */}
      {stats && (
        <div className="flex gap-4 text-sm text-slate-400">
          <span>{stats.total} Teams</span>
          <span>•</span>
          <span>Top: {stats.topScore}pts</span>
          <span>•</span>
          <span>Avg: {stats.avg}pts</span>
        </div>
      )}

      {/* All Team Verdicts */}
      <RoastDisplay
        dashboardData={data}
        autoRefresh={true}
      />
    </div>
  );
}