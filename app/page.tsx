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
    <div className={`text-xs px-2 py-1 rounded-full ${
      isLive ? "bg-green-500/20 text-green-400"
             : "bg-yellow-500/20 text-yellow-400"
    }`}>
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

  const [showRace, setShowRace] = useState(false);
  const [raceMatch, setRaceMatch] = useState(1);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceKey, setRaceKey] = useState(0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  const list = data?.leaders || [];
  const leagueData = data?.leagueData || [];

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-3xl font-bold">
            🏆 ADSK IPL Fantasy
          </h1>
          <StatusBadge isLive={!!isLive} />
        </div>

        <TopPerformer data={list} />

        {/* Charts (stable) */}
        <ChartsSection list={list} />

        <div className="mt-6">
          <TeamCards teams={list} />
        </div>

        <div className="mt-6">
          <PointDifferences data={list} />
        </div>

        <div className="mt-6">
          <DetailedDataTable data={list} />
        </div>

        {/* 🎬 RACE */}
        <div className="mt-8">
          <GlassCard>

            <div className="flex justify-between mb-4">
              <div>
                <div className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">🎬 Race Replay</div>
                {showRace && (
                  <div className="text-yellow-400 text-sm">
                    Match {raceMatch}
                  </div>
                )}
              </div>

              {!raceFinished ? (
                <button
                  onClick={() => setShowRace(!showRace)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded"
                >
                  {showRace ? "Hide" : "View"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRaceFinished(false);
                    setRaceMatch(1);
                    setRaceKey((k) => k + 1);
                    setShowRace(true);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  🔁 Replay
                </button>
              )}
            </div>

            {showRace && (
              <RaceSection
                key={raceKey}
                data={leagueData}
                onMatchChange={setRaceMatch}
                onFinish={() => setRaceFinished(true)}
              />
            )}

          </GlassCard>
        </div>

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
  const [finished, setFinished] = useState(false); // ✅ local state

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

  // 🔥 SAFE animation loop
  useEffect(() => {
    if (!standings.length) return;

    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= standings.length - 1) {
          clearInterval(interval);
          setFinished(true); // ✅ only local update
          return s;
        }
        return s + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [standings.length]);

  // 🔄 Update match label
  useEffect(() => {
    if (onMatchChange) {
      onMatchChange(step + 1);
    }
  }, [step]);

  // 🔔 Notify parent safely AFTER render
  useEffect(() => {
    if (finished && onFinish) {
      onFinish(); // ✅ safe
    }
  }, [finished]);

  const current = standings[step];
  const max = Math.max(...current.map((t: any) => t.points));

  return (
    <motion.div layout className="space-y-3">
      {current.map((t: any) => {
        const width = (t.points / max) * 100;

        const isLeader = t.rank === 1;
        const isTop = t.rank <= 3;
        const isMid = t.rank <= 5;
        const isBottom = t.rank >= 6;

        return (
          <motion.div
            key={t.team}
            layout
            transition={{ type: "spring", stiffness: 120, damping: 25 }}
            className={`p-3 rounded-xl border ${
              isLeader
                ? "border-yellow-400/30 bg-yellow-400/5"
                : isTop
                ? "border-green-400/20 bg-green-400/5"
                : isBottom
                ? "border-red-400/20 bg-red-400/5"
                : "border-blue-400/20 bg-blue-400/5"
            }`}
          >
            <div className="flex justify-between text-sm mb-1">
              <span>#{t.rank} {t.team}</span>
              <span>{t.points.toFixed(0)}</span>
            </div>

            <div className="bg-slate-700 h-2 rounded">
              <motion.div
                className={`h-2 rounded ${
                  isLeader
                    ? "bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500"
                    : isTop
                    ? "bg-gradient-to-r from-green-400 via-emerald-400 to-green-500"
                    : isBottom
                    ? "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"
                    : "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                }`}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.7 }}
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