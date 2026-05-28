"use client";

import React, {
  useState,
  useEffect,
} from "react";

import { useDashboardData } from "./hooks/useDashboardData";

import Summary from "./components/Summary";
import HistoryInsights from "./components/HistoryInsights";
import TopPerformer from "./components/TopPerformer";
import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import PointDifferences from "./components/PointDifferences";
import LiveMatchTicker from "./components/LiveMatchTicker";
import DetailedDataTable from "./components/DetailedDataTable";
import TeamCards from "./components/TeamCards";

/* ⚡ PLAYOFF MODE */
const PLAYOFF_MODE = true;

/* STATUS */
function StatusBadge({
  isLive,
}: {
  isLive: boolean;
}) {
  return (
    <div
      className={`text-xs px-4 py-2 rounded-full border backdrop-blur-xl font-semibold tracking-[0.15em] transition-all ${
        isLive
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20 shadow-[0_0_25px_rgba(16,185,129,0.18)]"
          : "bg-slate-300/10 text-slate-200 border-slate-200/15 shadow-[0_0_20px_rgba(226,232,240,0.08)]"
      }`}
    >
      {isLive
        ? "● LIVE"
        : "SNAPSHOT"}
    </div>
  );
}

/* GLASS CARD */
function GlassCard({
  children,
  className = "",
}: any) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(15,23,42,0.5)] ${className}`}
    >
      {children}
    </div>
  );
}

/* CHARTS */
function ChartsSection({
  list,
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="p-5">
        <DailyChart data={list} />
      </GlassCard>

      <GlassCard className="p-5">
        <OverallChart data={list} />
      </GlassCard>
    </div>
  );
}

export default function Home() {
  const { data, loading } =
    useDashboardData();

  const [historyData, setHistoryData] =
    useState<any>(null);

  useEffect(() => {
    fetch("/api/ipl/history-test")
      .then((res) => res.json())
      .then(setHistoryData)
      .catch(() =>
        setHistoryData(null)
      );
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white text-xl">
        Loading War Room...
      </div>
    );
  }

  const list =
    data?.leaders || [];

  const updatedAt =
    data?.updatedAt
      ? new Date(
          data.updatedAt
        )
      : null;

  const isLive =
    updatedAt &&
    Date.now() -
      updatedAt.getTime() <
      120000;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* BACKGROUND FX */}
      {PLAYOFF_MODE && (
        <>
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-cyan-400/10 blur-[180px]" />

            <div className="absolute bottom-[-200px] right-[-100px] w-[700px] h-[700px] bg-violet-500/10 blur-[180px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_40%)]" />
          </div>

          {/* BADGE */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="px-6 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 backdrop-blur-xl text-cyan-200 text-xs sm:text-sm font-bold tracking-[0.25em] shadow-[0_0_35px_rgba(34,211,238,0.2)] animate-pulse">
              ⚡ PLAYOFF WAR ROOM
            </div>
          </div>
        </>
      )}

      <LiveMatchTicker />

      <div className="max-w-7xl mx-auto px-5 pt-24 pb-10 relative z-10">
        {/* HERO */}
        <GlassCard className="p-8 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-400/10 blur-[120px] rounded-full" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div>
              <div className="text-cyan-300 text-xs tracking-[0.35em] uppercase mb-3 font-semibold">
                IPL PLAYOFFS 2026
              </div>

              <h1 className="text-4xl sm:text-6xl font-black leading-none bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                ADSK WAR ROOM
              </h1>

              <p className="text-slate-400 mt-4 max-w-xl text-sm sm:text-base">
                Real-time fantasy
                analytics, momentum
                tracking and playoff
                race intelligence.
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-4">
              <StatusBadge
                isLive={!!isLive}
              />

              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-1">
                  Last Updated
                </div>

                <div className="text-sm text-cyan-200 font-semibold">
                  {updatedAt
                    ? updatedAt.toLocaleTimeString()
                    : "--"}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* TOP PERFORMER */}
        <TopPerformer data={list} />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">
            {/* CHARTS */}
            <ChartsSection list={list} />

            {/* HISTORY */}
            {historyData && (
              <GlassCard className="p-5">
                <HistoryInsights
                  history={
                    historyData
                  }
                />
              </GlassCard>
            )}

            {/* CAPTAINS */}
            <GlassCard className="p-5">
              <TeamCards
                teams={list}
              />
            </GlassCard>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <GlassCard className="p-5">
              <div className="mb-4">
                <div className="text-cyan-300 text-xs uppercase tracking-[0.25em] mb-2">
                  Point Delta
                </div>

                <h2 className="text-xl font-bold">
                  Momentum Tracker
                </h2>
              </div>

              <PointDifferences
                data={list}
              />
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-cyan-300 text-xs uppercase tracking-[0.25em] mb-2">
                Race Status
              </div>

              <div className="space-y-4 mt-4">
                {list
                  .slice()
                  .sort(
                    (
                      a: any,
                      b: any
                    ) =>
                      b.points -
                      a.points
                  )
                  .slice(0, 5)
                  .map(
                    (
                      t: any,
                      idx: number
                    ) => (
                      <div
                        key={t.name}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm text-slate-400">
                            #
                            {idx + 1}
                          </div>

                          <div className="font-semibold text-white">
                            {t.name}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-cyan-300 font-bold text-lg">
                            {Number(
                              t.points
                            ).toLocaleString()}
                          </div>

                          <div className="text-xs text-slate-500">
                            total pts
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6">
          <GlassCard className="p-5">
            <DetailedDataTable
              data={list}
              history={
                historyData
              }
            />
          </GlassCard>
        </div>

        {/* SUMMARY */}
        <div className="mt-6">
          <GlassCard className="p-5">
            <Summary />
          </GlassCard>
        </div>
      </div>
    </main>
  );
}