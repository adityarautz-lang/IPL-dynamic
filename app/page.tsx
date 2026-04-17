"use client";

import { useEffect, useState } from "react";
import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import PerformanceTracker from "./components/PerformanceTracker";
import Summary from "./components/Summary";
import type { DashboardData } from "./types";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/ipl")
      .then((res) => res.json() as Promise<DashboardData>)
      .then(setData);
  }, []);

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading dashboard...
      </div>
    );

  const highestMatchId = data.daily.reduce((maxId, row) => {
    const parsed = Number(row.day.replace("Match ", ""));
    return Number.isFinite(parsed) ? Math.max(maxId, parsed) : maxId;
  }, 0);

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#020617] to-[#0a0e27] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-6xl">🏏</span>
            <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Autodesk IPL Fantasy 2026
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-24">
            Real-time Performance Analytics
          </p>
        </div>

        {/* First Row: Two Columns */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Daily Match Performance */}
          <div>
            <DailyChart
              data={data.daily[data.daily.length - 1]}
              matchId={highestMatchId}
            />
          </div>

          {/* Overall Leaderboard */}
          <div>
            <OverallChart data={data.overall} />
          </div>
        </div>

        {/* Second Row: Full Width Performance Tracker */}
        <div>
          <PerformanceTracker data={data.daily} />
        </div>

        {/* Third Row: Season Summary */}
        <div className="mt-10">
          <Summary data={data} />
        </div>
      </div>
    </main>
  );
}
