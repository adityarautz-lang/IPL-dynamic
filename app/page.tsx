"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useDashboardData } from "./hooks/useDashboardData";

import Summary from "./components/Summary";
import TopPerformer from "./components/TopPerformer";
import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import PointDifferences from "./components/PointDifferences";
import LiveMatchTicker from "./components/LiveMatchTicker";
import DetailedDataTable from "./components/DetailedDataTable";
import TeamCards from "./components/TeamCards";

/* STATUS */
function StatusBadge({ isLive }: { isLive: boolean }) {
  return (
    <div
      className={`text-xs px-2 py-1 rounded-full ${
        isLive
          ? "bg-green-500/20 text-green-400"
          : "bg-yellow-500/20 text-yellow-400"
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
      <GlassCard>
        <DailyChart data={list} />
      </GlassCard>

      <GlassCard>
        <OverallChart data={list} />
      </GlassCard>
    </div>
  );
});

export default function Home() {
  const { data, loading } = useDashboardData();

  // 🔥 NEW: history state
  const [historyData, setHistoryData] = useState<any>(null);

  // 🔥 NEW: fetch history once
  useEffect(() => {
    fetch("/api/ipl/history-test")
      .then((res) => res.json())
      .then(setHistoryData)
      .catch(() => setHistoryData(null));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  const list = data?.leaders || [];
  const leagueData = data?.leagueData || [];

  const completedPct = data?.completedPct;
  const completedMatches = data?.completedMatches;

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt)
    : null;

  const isLive =
    updatedAt && Date.now() - updatedAt.getTime() < 120000;

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <LiveMatchTicker />

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl sm:text-3xl font-bold">
            🏆 ADSK IPL Fantasy
          </h1>
          <StatusBadge isLive={!!isLive} />
        </div>

        {/* TOP PERFORMER */}
        <TopPerformer
          data={list}
          completedPct={completedPct}
          completedMatches={completedMatches}
        />

        {/* Charts */}
        <ChartsSection list={list} />

        <div className="mt-6">
          <TeamCards teams={list} />
        </div>

        <div className="mt-6">
          <PointDifferences data={list} />
        </div>

        {/* 🔥 UPDATED: pass history */}
        <div className="mt-6">
          <DetailedDataTable data={list} history={historyData} />
        </div>

        <div className="mt-6">
          <Summary />
        </div>
      </div>
    </main>
  );
}

/* 🔥 FANCY RACE (unchanged) */
function RaceSection({ data, onMatchChange, onFinish }: any) {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!data || data.length === 0) return <div>No data</div>;

  const standings = useMemo(() => {
    const totals: any = {};
    const result: any[] = [];

    data.forEach((t: any) => (totals[t.teamName] = 0));
    const totalMatches = data[0].matches.length;

    for (let i = totalMatches; i >= 1; i--) {
      data.forEach((team: any) => {
        const m = team.matches.find((x: any) => x.matchIndex === i);
        totals[team.teamName] += m?.points || 0;
      });

      const ranking = Object.entries(totals)
        .map(([team, pts]: any) => ({ team, points: pts }))
        .sort((a: any, b: any) => b.points - a.points)
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
        if (s >= standings.length - 1) {
          clearInterval(interval);
          setFinished(true);
          return s;
        }
        return s + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
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
  const max = Math.max(...current.map((t: any) => t.points));

  return (
    <motion.div layout className="space-y-3">
      {current.map((t: any) => {
        const width = (t.points / max) * 100;

        return (
          <motion.div
            key={t.team}
            layout
            className="p-3 rounded-xl border border-blue-400/20 bg-blue-400/5"
          >
            <div className="flex justify-between text-sm mb-1">
              <span>
                #{t.rank} {t.team}
              </span>
              <span>{t.points.toFixed(0)}</span>
            </div>

            <div className="bg-slate-700 h-2 rounded">
              <motion.div
                className="h-2 rounded bg-blue-500"
                animate={{ width: `${width}%` }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function GlassCard({ children }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      {children}
    </div>
  );
}