"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import PerformanceTracker from "./components/PerformanceTracker";
import Summary from "./components/Summary";
import PointDifferences from "./components/PointDifferences";
import type { DashboardData } from "./types";
import LiveMatchTicker from "./components/LiveMatchTicker";
import DetailedDataTable from "./components/DetailedDataTable";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboardData = () => {
      fetch(`/api/ipl?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json() as Promise<DashboardData>)
        .then(setData);
    };

    loadDashboardData();
    const intervalId = window.setInterval(loadDashboardData, 30000);
    window.addEventListener("focus", loadDashboardData);
    document.addEventListener("visibilitychange", loadDashboardData);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadDashboardData);
      document.removeEventListener("visibilitychange", loadDashboardData);
    };
  }, []);

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="animate-pulse text-xl tracking-wide">
          🚀 Loading your empire...
        </div>
      </div>
    );

  const highestMatchId = data.daily.reduce((maxId, row) => {
    const parsed = Number(row.day.replace("Match ", ""));
    return Number.isFinite(parsed) ? Math.max(maxId, parsed) : maxId;
  }, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-125 h-125 bg-blue-500/20 blur-[120px] -top-25 -left-25" />
        <div className="absolute w-100 h-100 bg-purple-500/20 blur-[120px] -bottom-25 -right-25" />
      </div>
      <LiveMatchTicker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-10">
            {/* LEFT: Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                  🏏
                </span>

                <h1 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Autodesk IPL Fun Fantasy 2026
                </h1>
              </div>

              <p className="text-slate-400 text-sm mt-2 ml-12">
                Real-time Performance Analytics (aka stress simulator)
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* First Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <GlassCard delay={0.1} className="p-0 lg:p-6">
            <DailyChart
              data={data.daily[data.daily.length - 1]}
              matchId={highestMatchId}
            />
          </GlassCard>

          <GlassCard delay={0.2} className="p-0 lg:p-6">
            <OverallChart
              key={`overall-${data.updatedAt ?? data.source ?? "manual"}`}
              data={data.overall}
            />
          </GlassCard>
        </div>

        {/* Second Row */}
        <GlassCard delay={0.3} className="p-0 lg:p-6">
          <PerformanceTracker data={data.daily} />
        </GlassCard>

        {/* Third Row */}
        <div className="mt-8">
          <GlassCard delay={0.4} className="p-0 lg:p-6">
            <PointDifferences data={data.overall} />
          </GlassCard>
        </div>

        {/* Fourth Row */}
        <div className="mt-8">
          <GlassCard delay={0.5} className="p-0 lg:p-6">
            <Summary data={data} />
          </GlassCard>
        </div>

        {/* Fifth Row */}
        <div className="mt-8">
          <GlassCard delay={0.6} className="p-0 lg:p-6">
            <DetailedDataTable data={data} />
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

/* 🔮 Reusable Glass Card */
function GlassCard({
  children,
  delay = 0,
  className = "p-6",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 0px 40px rgba(99,102,241,0.25)",
      }}
      className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl transition-all ${className}`}
    >
      {/* subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

      {children}
    </motion.div>
  );
}
