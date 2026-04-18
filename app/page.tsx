"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[120px] bottom-[-100px] right-[-100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="text-6xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
              🏏
            </span>

            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              ADSK IPL Fun Fantasy league 2026
            </h1>
          </div>

          <p className="text-slate-400 text-lg ml-20">
            Real-time Performance Analytics (aka stress simulator)
          </p>
        </motion.div>

        {/* First Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <GlassCard delay={0.1}>
            <DailyChart
              data={data.daily[data.daily.length - 1]}
              matchId={highestMatchId}
            />
          </GlassCard>

          <GlassCard delay={0.2}>
            <OverallChart data={data.overall} />
          </GlassCard>
        </div>

        {/* Second Row */}
        <GlassCard delay={0.3}>
          <PerformanceTracker data={data.daily} />
        </GlassCard>

        {/* Third Row */}
        <div className="mt-10">
          <GlassCard delay={0.4}>
            <Summary data={data} />
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
}: {
  children: React.ReactNode;
  delay?: number;
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
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl transition-all"
    >
      {/* subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {children}
    </motion.div>
  );
}
