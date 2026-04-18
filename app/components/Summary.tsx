"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DashboardData } from "../types";

const getStdDeviation = (values: number[]) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

export default function Summary({ data }: { data: DashboardData }) {
  const matchCount = data.daily.length;

  const teamNames = Object.keys(data.daily[0] || {}).filter(
    (key) => key !== "day",
  );

  const teamScores = teamNames.reduce<Record<string, number[]>>((acc, team) => {
    acc[team] = data.daily.map((row) => Number(row[team]) || 0);
    return acc;
  }, {});

  const allPerformances = data.daily.flatMap((row) =>
    teamNames.map((team) => ({
      team,
      day: row.day,
      points: Number(row[team]) || 0,
    })),
  );

  const highestSingle = allPerformances.reduce((best, current) =>
    current.points > best.points ? current : best,
  );

  const lowestSingle = allPerformances.reduce((worst, current) =>
    current.points < worst.points ? current : worst,
  );

  const averageScores = teamNames.map((team) => {
    const values = teamScores[team];
    return {
      team,
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      total: values.reduce((sum, value) => sum + value, 0),
      volatility: getStdDeviation(values),
      zeroCount: values.filter((value) => value === 0).length,
      firstMatch: values[0],
      lastMatch: values[values.length - 1],
    };
  });

  const mostZeros = [...averageScores].sort(
    (a, b) => b.zeroCount - a.zeroCount,
  )[0];

  const matchChanges = data.daily.flatMap((row, index) => {
    if (index === 0) return [];
    return teamNames.map((team) => ({
      team,
      day: row.day,
      delta: Number(row[team]) - Number(data.daily[index - 1][team]),
    }));
  });

  const bestAverage = [...averageScores].sort(
    (a, b) => b.average - a.average,
  )[0];

  const mostConsistent = [...averageScores].sort(
    (a, b) => a.volatility - b.volatility,
  )[0];

  const mostImproved = [...averageScores].sort(
    (a, b) => b.lastMatch - b.firstMatch - (a.lastMatch - a.firstMatch),
  )[0];

  const bestSurge = matchChanges.reduce(
    (best, current) => (current.delta > best.delta ? current : best),
    matchChanges[0],
  );

  const biggestSlide = matchChanges.reduce(
    (worst, current) => (current.delta < worst.delta ? current : worst),
    matchChanges[0],
  );

  const sarcasmModes = {
    roast: [
      "Peak entertainment right here!",
      "Absolutely dominating the charts!",
    ],
    commentator: [
      "And what a turnaround we're witnessing!",
      "The pressure is on for the next match!",
    ],
    meme: ["That's not how you do it, chief 💀", "Bruh moment detected 🍿"],
  };

  const selectedMode = useMemo(() => {
    const modeKeys = Object.keys(sarcasmModes) as Array<
      keyof typeof sarcasmModes
    >;
    // eslint-disable-next-line react-hooks/purity
    return modeKeys[Math.floor(Math.random() * modeKeys.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const funPhrases = sarcasmModes[selectedMode];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full mt-10 p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* glow */}
      <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10 blur-2xl pointer-events-none" />

      {/* shimmer */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" />

      <div className="relative z-10">
        {/* header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold bg-linear-to-r from-fuchsia-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            🧠 Season Summary
          </h2>
          <p className="text-slate-400 max-w-2xl mt-2">
            AI-generated insights from {matchCount} matches (with attitude)
          </p>
        </div>

        {/* stat cards */}
        <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
          {[
            {
              title: "Single-match king",
              team: highestSingle.team,
              desc: `${highestSingle.points} pts in ${highestSingle.day}`,
            },
            {
              title: "Hardest crash",
              team: lowestSingle.team,
              desc: `${lowestSingle.points} pts in ${lowestSingle.day}`,
            },
            {
              title: "Most reliable",
              team: mostConsistent.team,
              desc: `volatility ${mostConsistent.volatility.toFixed(1)}`,
            },
            {
              title: "Season leader",
              team: bestAverage.team,
              desc: `avg ${bestAverage.average.toFixed(1)} pts`,
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
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 0px 30px rgba(139,92,246,0.25)",
              }}
              className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <p className="text-xs uppercase tracking-widest text-slate-400">
                {card.title}
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {card.team}
              </p>
              <p className="text-slate-300 text-sm mt-1">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* fun phrases */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {funPhrases.map((phrase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
              className="rounded-3xl bg-slate-900/70 p-5 border border-white/5"
            >
              <p className="text-slate-200 leading-7">{phrase}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
