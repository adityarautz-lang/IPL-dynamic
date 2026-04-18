"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DashboardData } from "../types";
import { aiAgent } from "../lib/aiAgent";

/**
 * ---------- Utils ----------
 */

const getStdDeviation = (values: number[]) => {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * ---------- Main ----------
 */

export default function Summary({ data }: { data: DashboardData }) {
  const matchCount = data.daily.length;

  const { cards } = useMemo(() => {
    const teamNames = Object.keys(data.daily[0] || {}).filter(
      (k) => k !== "day",
    );

    const teamScores = teamNames.reduce<Record<string, number[]>>(
      (acc, team) => {
        acc[team] = data.daily.map((row) => Number(row[team]) || 0);
        return acc;
      },
      {},
    );

    const allPerformances = data.daily.flatMap((row) =>
      teamNames.map((team) => ({
        team,
        day: row.day,
        points: Number(row[team]) || 0,
      })),
    );

    const highestSingle = allPerformances.reduce((a, b) =>
      b.points > a.points ? b : a,
    );

    const lowestSingle = allPerformances.reduce((a, b) =>
      b.points < a.points ? b : a,
    );

    const averages = teamNames.map((team) => {
      const vals = teamScores[team];
      return {
        team,
        avg: vals.reduce((s, v) => s + v, 0) / vals.length,
        vol: getStdDeviation(vals),
        first: vals[0],
        last: vals[vals.length - 1],
      };
    });

    const bestAverage = [...averages].sort((a, b) => b.avg - a.avg)[0];
    const mostConsistent = [...averages].sort((a, b) => a.vol - b.vol)[0];

    const matchChanges = data.daily.flatMap((row, i) => {
      if (i === 0) return [];
      return teamNames.map((team) => ({
        team,
        day: row.day,
        delta: Number(row[team]) - Number(data.daily[i - 1][team]),
      }));
    });

    const bestSurge = matchChanges.reduce((a, b) =>
      b.delta > a.delta ? b : a,
    );

    const biggestSlide = matchChanges.reduce((a, b) =>
      b.delta < a.delta ? b : a,
    );

    /**
     * 🧠 NEW: Daily AI Cards
     */
    const latestDay = data.daily[data.daily.length - 1];

    const dailyScores = teamNames.map((team) => ({
      team,
      points: Number(latestDay[team]) || 0,
    }));

    const dailyHigh = [...dailyScores].sort((a, b) => b.points - a.points)[0];
    const dailyLow = [...dailyScores].sort((a, b) => a.points - b.points)[0];

    /**
     * 🎴 Cards (centralized config)
     */
    const cards = [
      {
        title: "Single-match king",
        team: highestSingle.team,
        desc: aiAgent.praise(highestSingle.team, highestSingle.points),
      },
      {
        title: "Hardest crash",
        team: lowestSingle.team,
        desc: aiAgent.roast(lowestSingle.team, lowestSingle.points),
      },
      {
        title: "Most reliable",
        team: mostConsistent.team,
        desc: aiAgent.consistency(mostConsistent.team, mostConsistent.vol),
      },
      {
        title: "Season leader",
        team: bestAverage.team,
        desc: aiAgent.leader(bestAverage.team, bestAverage.avg),
      },
      {
        title: "Biggest surge",
        team: bestSurge.team,
        desc: `+${bestSurge.delta} (${bestSurge.day})`,
      },
      {
        title: "Biggest collapse",
        team: biggestSlide.team,
        desc: `${Math.abs(biggestSlide.delta)} drop`,
      },

      /**
       * 🤖 AI CARDS (NEW)
       */
      {
        title: "🔥 Today’s MVP",
        team: dailyHigh.team,
        desc: aiAgent.praise(dailyHigh.team, dailyHigh.points),
      },
      {
        title: "💀 Today’s Victim",
        team: dailyLow.team,
        desc: aiAgent.roast(dailyLow.team, dailyLow.points),
      },
    ];

    return { cards };
  }, [data]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full mt-10 p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10 blur-2xl" />
      <div className="absolute inset-0 opacity-20 animate-shimmer" />

      <div className="relative z-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold bg-linear-to-r from-fuchsia-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            🧠 Season Summary
          </h2>
          <p className="text-slate-400 mt-2">
            AI-generated insights from {matchCount} matches (with attitude)
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 0px 30px rgba(139,92,246,0.25)",
              }}
              className="p-5 rounded-3xl bg-white/5 border border-white/10"
            >
              <p className="text-xs uppercase text-slate-400">{card.title}</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {card.team}
              </p>
              <p className="text-slate-300 text-sm mt-1">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
