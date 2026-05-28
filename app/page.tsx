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

/* TEAM LOGOS */
const TEAM_LOGOS: Record<
  string,
  string
> = {
  "Deccan Dominators":
    "🦁",

  SquadSeven9: "⚔️",

  "RSAwesome 11":
    "🛡️",

  "VATVAGHOOL XI":
    "👹",

  Watapi: "🌊",

  PKs11: "🔥",

  "Bat Bowl XI":
    "🏏",

  RushS01: "💀",
};

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

/* ⚔️ PLAYOFF BATTLES */
function PlayoffBattles({
  teams,
}: any) {
  if (!teams?.length) return null;

  const sorted = [...teams].sort(
    (a: any, b: any) =>
      b.points - a.points
  );

  const getThreat = (
    gap: number
  ) => {
    if (gap < 200)
      return {
        label:
          "🔥 VERY CLOSE",

        color:
          "text-red-400",

        bar:
          "bg-red-400",

        pct: "18%",
      };

    if (gap < 500)
      return {
        label:
          "⚠️ HIGH",

        color:
          "text-orange-400",

        bar:
          "bg-orange-400",

        pct: "35%",
      };

    if (gap < 1000)
      return {
        label:
          "🟡 MEDIUM",

        color:
          "text-yellow-300",

        bar:
          "bg-yellow-300",

        pct: "55%",
      };

    return {
      label: "❄️ SAFE",

      color:
        "text-cyan-300",

      bar:
        "bg-cyan-300",

      pct: "82%",
    };
  };

  return (
    <GlassCard className="p-4 sm:p-5 mt-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-cyan-400/10 blur-[120px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
            PLAYOFF RACE
          </div>

          <h2 className="text-lg sm:text-xl font-bold">
            ⚔️ Playoff Battles
          </h2>
        </div>

        <div className="hidden sm:block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-400/20">
          LIVE
        </div>
      </div>

      {/* ROWS */}
      <div className="space-y-3 relative z-10">
        {sorted
          .slice(0, -1)
          .map(
            (
              team: any,
              idx: number
            ) => {
              const rival =
                sorted[idx + 1];

              const gap =
                team.points -
                rival.points;

              const threat =
                getThreat(gap);

              return (
                <div
                  key={team.name}
                  className="rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.04] to-transparent px-4 py-4"
                >
                  <div className="flex flex-col gap-4">
                    {/* TOP */}
                    <div className="flex items-center gap-3">
                      {/* RANK */}
                      <div className="text-slate-500 text-sm font-semibold w-6 shrink-0">
                        #
                        {idx + 1}
                      </div>

                      {/* LOGO */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        {TEAM_LOGOS[
                          team.name
                        ] || "🏏"}
                      </div>

                      {/* TEAM INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-lg font-bold text-white truncate">
                          {
                            team.name
                          }
                        </div>

                        <div className="text-slate-400 text-xs sm:text-sm truncate">
                          vs{" "}
                          {
                            rival.name
                          }
                        </div>
                      </div>

                      {/* GAP */}
                      <div className="text-right shrink-0">
                        <div className="text-lg sm:text-2xl font-black text-white leading-none">
                          +
                          {Number(
                            gap
                          ).toLocaleString()}
                        </div>

                        <div className="text-slate-500 text-[10px] sm:text-xs mt-1">
                          pts
                        </div>
                      </div>
                    </div>

                    {/* BAR */}
                    <div>
                      <div className="flex justify-between items-center mb-2 text-[10px] sm:text-xs">
                        <span
                          className={`font-semibold ${threat.color}`}
                        >
                          {
                            threat.label
                          }
                        </span>

                        <span className="text-slate-500">
                          Pressure
                        </span>
                      </div>

                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${threat.bar} rounded-full shadow-[0_0_20px_currentColor]`}
                          style={{
                            width:
                              threat.pct,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
      </div>
    </GlassCard>
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
      {/* PLAYOFF FX */}
      {PLAYOFF_MODE && (
        <>
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-cyan-400/10 blur-[180px]" />

            <div className="absolute bottom-[-200px] right-[-100px] w-[700px] h-[700px] bg-violet-500/10 blur-[180px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_40%)]" />
          </div>

          {/* BADGE */}
          <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 wd-pt-10" style="padding-top: 30px;"><div class="px-6 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 backdrop-blur-xl text-cyan-200 text-xs sm:text-sm font-bold tracking-[0.25em] shadow-[0_0_35px_rgba(34,211,238,0.2)] animate-pulse">⚡ PLAYOFF MODE</div></div>
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
              ADSK IPL FANTASY LEAGUE
            </h1>
          </div>

          <StatusBadge
            isLive={!!isLive}
          />
        </div>

        {/* TOP PERFORMER */}
        <TopPerformer data={list} />

        {/* NEW PANEL */}
        <PlayoffBattles
          teams={list}
        />

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