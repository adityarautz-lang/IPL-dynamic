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

/* 🟢 Status Badge */
function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <div
      className={`text-xs px-2 py-1 rounded-full font-semibold ${
        isLive
          ? "bg-green-500/20 text-green-400 animate-pulse"
          : "bg-yellow-500/20 text-yellow-400"
      }`}
    >
      {isLive ? "LIVE" : "SNAPSHOT"}
    </div>
  );
}

export default function Home() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="animate-pulse text-xl tracking-wide">
          🚀 Loading your empire...
        </div>
      </div>
    );
  }

  const list = Array.isArray(data?.leaders) ? data.leaders : [];

  const updatedAt = data?.updatedAt ? new Date(data.updatedAt) : null;

  const isLive =
  updatedAt && Date.now() - updatedAt.getTime() < 120 * 1000;
  const highestMatchId = list.reduce(
    (max, row) => Math.max(max, row.matchId || 0),
    0
  );

  const liveMatchId = highestMatchId;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏏</span>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Autodesk IPL Fun Fantasy 2026
              </h1>
            </div>

            <StatusBadge isLive={!!isLive} />
          </div>

          <p className="text-slate-400 text-sm mt-2">
            Real-time Performance Analytics
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Last updated: {updatedAt?.toLocaleTimeString() || "—"}
          </p>
        </motion.div>

        {/* Row 1 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <HeaderWithStatus isLive={!!isLive} />
            <DailyChart data={list} matchId={liveMatchId} />
          </GlassCard>

          <GlassCard>
            <HeaderWithStatus isLive={!!isLive} />
            <OverallChart data={list} />
          </GlassCard>
        </div>

        {/* Row 2 */}
        <GlassCard>
          <HeaderWithStatus isLive={!!isLive} />
          <PerformanceTracker data={list} />
        </GlassCard>

        {/* Row 3 */}
        <div className="mt-8">
          <GlassCard>
            <HeaderWithStatus isLive={!!isLive} />
            <PointDifferences data={list} />
          </GlassCard>
        </div>

        {/* Row 4 */}
        <div className="mt-8">
          <GlassCard>
            <Summary data={data} />
          </GlassCard>
        </div>

        {/* Row 5 */}
        <div className="mt-8">
          <GlassCard>
            <DetailedDataTable data={list} />
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

/* Small header for each chart */
function HeaderWithStatus({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex justify-end mb-2">
      <StatusBadge isLive={isLive} />
    </div>
  );
}

/* Glass Card */
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 0px 40px rgba(99,102,241,0.25)",
      }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl lg:p-6"
    >
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}