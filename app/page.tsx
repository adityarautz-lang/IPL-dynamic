"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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

/* 🏆 PLAYOFF MODE */
const PLAYOFF_MODE = true;

/* STATUS */
function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <div
      className={`text-xs px-3 py-1.5 rounded-full border backdrop-blur-xl font-semibold tracking-wide ${
        isLive
          ? "bg-green-500/20 text-green-300 border-green-400/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          : "bg-yellow-500/20 text-yellow-200 border-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
      }`}
    >
      {isLive ? "LIVE" : "SNAPSHOT"}
    </div>
  );
}

/* 🔥 CHARTS ISOLATED */
const ChartsSection = React.memo(function ChartsSection({ list }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <GlassCard playoff={PLAYOFF_MODE}>
        <DailyChart data={list} />
      </GlassCard>

      <GlassCard playoff={PLAYOFF_MODE}>
        <OverallChart data={list} />
      </GlassCard>
    </div>
  );
});

export default function Home() {
  const { data, loading } = useDashboardData();

  const [historyData, setHistoryData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/ipl/history-test")
      .then((res) => res.json())
      .then(setHistoryData)
      .catch(() => setHistoryData(null));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const list = data?.leaders || [];

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt)
    : null;

  const isLive =
    updatedAt &&
    Date.now() - updatedAt.getTime() < 120000;

  return (
    <main
      className={`min-h-screen text-white relative overflow-hidden ${
        PLAYOFF_MODE
          ? "bg-black"
          : "bg-[#020617]"
      }`}
    >
      {/* 🏆 PLAYOFF EFFECTS */}
      {PLAYOFF_MODE && (
        <>
          {/* GOLD LIGHTING */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-yellow-400/10 blur-[180px]" />

            <div className="absolute bottom-[-200px] right-[-100px] w-[700px] h-[700px] bg-orange-500/10 blur-[180px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.08),transparent_45%)]" />
          </div>

          {/* PLAYOFF BADGE */}
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pt-10">
            <div className="px-5 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 backdrop-blur-xl text-yellow-300 text-xs sm:text-sm font-bold tracking-[0.25em] shadow-[0_0_30px_rgba(250,204,21,0.25)] animate-pulse">
              🏆 PLAYOFF MODE
            </div>
          </div>
        </>
      )}

      <LiveMatchTicker />

      <div className="max-w-7xl mx-auto px-5 pt-20 pb-8 relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl sm:text-3xl font-bold">
            {PLAYOFF_MODE
              ? "🏆 ADSK IPL PLAYOFFS 2026"
              : "🏆 ADSK IPL Fantasy"}
          </h1>

          <StatusBadge isLive={!!isLive} />
        </div>

        {/* TOP PERFORMER */}
        <TopPerformer data={list} />

        {/* HISTORY */}
        {historyData && (
          <HistoryInsights history={historyData} />
        )}

        {/* CHARTS */}
        <ChartsSection list={list} />

        {/* TEAM CARDS */}
        <div className="mt-6">
          <TeamCards teams={list} />
        </div>

        {/* DIFFERENCES */}
        <div className="mt-6">
          <PointDifferences data={list} />
        </div>

        {/* TABLE */}
        <div className="mt-6">
          <DetailedDataTable
            data={list}
            history={historyData}
          />
        </div>

        {/* SUMMARY */}
        <div className="mt-6">
          <Summary />
        </div>
      </div>
    </main>
  );
}

/* 🔥 FANCY RACE */
function RaceSection({
  data,
  onMatchChange,
  onFinish,
}: any) {
  const [step, setStep] = useState(0);

  const [finished, setFinished] =
    useState(false);

  if (!data || data.length === 0)
    return <div>No data</div>;

  const standings = useMemo(() => {
    const totals: any = {};

    const result: any[] = [];

    data.forEach(
      (t: any) =>
        (totals[t.teamName] = 0)
    );

    const totalMatches =
      data[0].matches.length;

    for (
      let i = totalMatches;
      i >= 1;
      i--
    ) {
      data.forEach((team: any) => {
        const m = team.matches.find(
          (x: any) =>
            x.matchIndex === i
        );

        totals[team.teamName] +=
          m?.points || 0;
      });

      const ranking = Object.entries(
        totals
      )
        .map(([team, pts]: any) => ({
          team,
          points: pts,
        }))
        .sort(
          (a: any, b: any) =>
            b.points - a.points
        )
        .map((t: any, idx: number) => ({
          team: t.team,
          rank: idx + 1,
          points: t.points,
        }));

      result.push(ranking);
    }

    return result;
  }, [data]);

  useEffect(() => {
    if (!standings.length) return;

    const interval = setInterval(() => {
      setStep((s) => {
        if (
          s >= standings.length - 1
        ) {
          clearInterval(interval);

          setFinished(true);

          return s;
        }

        return s + 1;
      });
    }, 1200);

    return () =>
      clearInterval(interval);
  }, [standings.length]);

  useEffect(() => {
    if (onMatchChange) {
      onMatchChange(step + 1);
    }
  }, [step]);

  useEffect(() => {
    if (finished && onFinish) {
      onFinish();
    }
  }, [finished]);

  const current = standings[step];

  const max = Math.max(
    ...current.map(
      (t: any) => t.points
    )
  );

  return (
    <motion.div
      layout
      className="space-y-3"
    >
      {current.map((t: any) => {
        const width =
          (t.points / max) * 100;

        return (
          <motion.div
            key={t.team}
            layout
            className="p-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 shadow-[0_0_25px_rgba(250,204,21,0.08)]"
          >
            <div className="flex justify-between text-sm mb-1">
              <span>
                #{t.rank} {t.team}
              </span>

              <span>
                {t.points.toFixed(0)}
              </span>
            </div>

            <div className="bg-slate-700 h-2 rounded">
              <motion.div
                className="h-2 rounded bg-yellow-400"
                animate={{
                  width: `${width}%`,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function GlassCard({
  children,
  playoff,
}: any) {
  return (
    <div
      className={`rounded-2xl p-4 border backdrop-blur-xl transition-all ${
        playoff
          ? "border-yellow-400/20 bg-yellow-400/5 shadow-[0_0_40px_rgba(250,204,21,0.08)]"
          : "border-white/10 bg-white/5"
      }`}
    >
      {children}
    </div>
  );
}