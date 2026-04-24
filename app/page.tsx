"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "./hooks/useDashboardData";

import Summary from "./components/Summary";
import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import PointDifferences from "./components/PointDifferences";
import LiveMatchTicker from "./components/LiveMatchTicker";
import DetailedDataTable from "./components/DetailedDataTable";
import TeamCards from "./components/TeamCards";

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-125 h-125 bg-blue-500/20 blur-[120px] -top-25 -left-25" />
        <div className="absolute w-100 h-100 bg-purple-500/20 blur-[120px] -bottom-25 -right-25" />
      </div>

      <LiveMatchTicker />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">🏆</span>
              <h1 className="text-[20px] sm:text-3xl md:text-4xl font-extrabold text-white">
                ADSK IPL Fun Fantasy 2026
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-6 sm:mb-8">
          {/* Daily */}
          <div>
            <GlassCard>
              <HeaderWithStatus isLive={!!isLive} />
              <div className="mt-4">
                <div className="h-60 sm:h-75 w-full">
                  <DailyChart data={list} />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Overall */}
          <div>
            <GlassCard>
              <HeaderWithStatus isLive={!!isLive} />
              <div className="mt-4">
                <div className="h-60 sm:h-75 w-full">
                  <OverallChart data={list} />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Captain Insights */}
        <div className="mt-6 sm:mt-8">
          <GlassCard>
            <HeaderWithStatus isLive={!!isLive} />
            <div className="mt-4">
              <TeamCards teams={list} />
            </div>
          </GlassCard>
        </div>

        {/* Point Differences */}
        <div className="mt-6 sm:mt-8">
          <GlassCard>
            <div className="mt-4">
              <PointDifferences data={list} />
            </div>
          </GlassCard>
        </div>

        {/* Table */}
        <div className="mt-6 sm:mt-8">
          <GlassCard>
            <DetailedDataTable data={list} />
          </GlassCard>
        </div>

        {/* AI Roast Zone - Now at the bottom! */}
        <div className="mt-6 sm:mt-8">
          <Summary data={data} />
        </div>
        
      </div>
    </main>
  );
}

/* Small header */
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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.01,
        boxShadow: "0px 0px 40px rgba(99,102,241,0.2)",
      }}
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6 overflow-hidden"
    >
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}