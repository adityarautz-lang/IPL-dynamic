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
}: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(15,23,42,0.5)] transition-all">
      {children}
    </div>
  );
}

/* CHARTS */
const ChartsSection =
  React.memo(function ChartsSection({
    list,
  }: any) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <GlassCard>
          <div className="p-5">
            <DailyChart data={list} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-5">
            <OverallChart data={list} />
          </div>
        </GlassCard>
      </div>
    );
  });

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
        Loading...
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
      {/* ⚡ PLAYOFF FX */}
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
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-cyan-300 text-xs tracking-[0.35em] uppercase mb-2 font-semibold">
              IPL PLAYOFFS 2026
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-none bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
              ADSK WAR ROOM
            </h1>
          </div>

          <StatusBadge
            isLive={!!isLive}
          />
        </div>

        {/* TOP PERFORMER */}
        <TopPerformer data={list} />

        {/* HISTORY */}
        {historyData && (
          <div className="mt-4">
            <HistoryInsights
              history={
                historyData
              }
            />
          </div>
        )}

        {/* CHARTS */}
        <ChartsSection list={list} />

        {/* TEAM CARDS */}
        <div className="mt-6">
          <GlassCard>
            <div className="p-5">
              <TeamCards
                teams={list}
              />
            </div>
          </GlassCard>
        </div>

        {/* DIFFERENCES */}
        <div className="mt-6">
          <GlassCard>
            <div className="p-5">
              <PointDifferences
                data={list}
              />
            </div>
          </GlassCard>
        </div>

        {/* TABLE */}
        <div className="mt-6">
          <GlassCard>
            <div className="p-5">
              <DetailedDataTable
                data={list}
                history={
                  historyData
                }
              />
            </div>
          </GlassCard>
        </div>

        {/* SUMMARY */}
        <div className="mt-6">
          <GlassCard>
            <div className="p-5">
              <Summary />
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}