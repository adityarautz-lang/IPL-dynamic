"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "./hooks/useDashboardData";

import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import PerformanceTracker from "./components/PerformanceTracker";
import Summary from "./components/Summary";
import PointDifferences from "./components/PointDifferences";
import LiveMatchTicker from "./components/LiveMatchTicker";
import DetailedDataTable from "./components/DetailedDataTable";

export default function Home() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="animate-pulse text-xl tracking-wide">
          🚀 Loading your dashboard...
        </div>
      </div>
    );
  }

  const list = Array.isArray(data?.leaders) ? data.leaders : [];

  // ✅ FIX: derive latest matchId from data
  const latestMatchId =
    list.length > 0
      ? Math.max(...list.map((l) => l.matchId ?? 0))
      : 0;

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <LiveMatchTicker />

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* ✅ Equal height charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 items-stretch">
          <GlassCard>
            <DailyChart data={list} matchId={latestMatchId} />
          </GlassCard>

          <GlassCard>
            <OverallChart data={list} />
          </GlassCard>
        </div>

        <div className="mt-8">
          <GlassCard>
            <PointDifferences data={list} />
          </GlassCard>
        </div>

        <div className="mt-8">
          <GlassCard>
            <Summary data={data} />
          </GlassCard>
        </div>

        <div className="mt-8">
          <GlassCard>
            <DetailedDataTable data={list} />
          </GlassCard>
        </div>

        <div className="mt-8">
          <GlassCard>
            <PerformanceTracker data={list} />
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

/* ✅ Updated GlassCard */
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="h-full relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl lg:p-6"
    >
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}