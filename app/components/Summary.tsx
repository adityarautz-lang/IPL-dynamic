"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DashboardData } from "../types";
import { aiAgent } from "../lib/aiAgent";
import { getStdDeviation } from "../lib/utils/getStdDeviation";

const extractPoints = (text: string): number => {
  const match = text.match(/[-+]?\d+/); // handles +18, -12, 42
  return match ? Number(match[0]) : 0;
};

// 🎲 shuffle helper (stable per update)
const shuffle = <T,>(arr: T[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function Summary({ data }: { data: DashboardData }) {
  const historicalData = data.daily.filter((row) => row.day !== "Live Update");
  const matchCount = historicalData.length;

  const { cards } = useMemo(() => {
    const teamNames = Array.from(
      new Set(historicalData.flatMap((row) => Object.keys(row))),
    ).filter((k) => k !== "day");

    const teamScores = teamNames.reduce<Record<string, number[]>>(
      (acc, team) => {
        acc[team] = historicalData
          .map((row) => (row[team] === undefined ? null : Number(row[team])))
          .filter((v) => v !== null) as number[];
        return acc;
      },
      {},
    );

    const allPerformances = historicalData.flatMap((row) =>
      teamNames
        .map((team) => ({
          team,
          day: row.day,
          points: row[team] === undefined ? null : Number(row[team]),
        }))
        .filter(
          (p): p is { team: string; day: string; points: number } =>
            p.points !== null,
        ),
    );

    const highestSingle = allPerformances.reduce((a, b) =>
      b.points > a.points ? b : a,
    );

    const averages = teamNames.map((team) => {
      const vals = teamScores[team];
      return {
        team,
        avg: vals.reduce((s, v) => s + v, 0) / vals.length,
        vol: getStdDeviation(vals),
      };
    });

    const mostConsistent = [...averages].sort((a, b) => a.vol - b.vol)[0];

    const matchChanges = historicalData.flatMap((row, i) => {
      if (i === 0) return [];
      return teamNames.map((team) => ({
        team,
        day: row.day,
        delta:
          Number(row[team] ?? 0) - Number(historicalData[i - 1][team] ?? 0),
      }));
    });

    const liveDay =
      data.daily.find((d) => d.day === "Live Update") ||
      data.daily[data.daily.length - 1];

    const dailyScores = teamNames.map((team) => ({
      team,
      points: Number(liveDay?.[team] ?? 0),
    }));

    const dailyHigh = [...dailyScores].sort((a, b) => b.points - a.points)[0];
    const dailyLow = [...dailyScores].sort((a, b) => a.points - b.points)[0];

    const zeroCounts = teamNames.map((team) => {
      const vals = teamScores[team];
      return {
        team,
        zeros: vals.filter((v) => v === 0).length,
      };
    });

    const mostDucks = [...zeroCounts].sort((a, b) => b.zeros - a.zeros)[0];

    const mostVolatile = [...averages].sort((a, b) => b.vol - a.vol)[0];

    const biggestComeback = matchChanges.reduce((a, b) =>
      b.delta > a.delta ? b : a,
    );

    const worstNonZero = allPerformances
      .filter((p) => p.points > 0)
      .reduce((a, b) => (b.points < a.points ? b : a));

    const rawCards = [
      {
        id: "king",
        title: "🏆 Peak Performance",
        team: highestSingle.team,
        desc: `${highestSingle.points} in ${highestSingle.day}. Absolute domination.`,
      },

      {
        id: "fail",
        title: "💀 Painful Low",
        team: worstNonZero.team,
        desc: `${worstNonZero.points} in ${worstNonZero.day}. Rough day.`,
      },

      {
        id: "consistent",
        title: "🎯 Most Consistent",
        team: mostConsistent.team,
        desc: `Volatility: ${mostConsistent.vol.toFixed(1)}.`,
      },

      {
        id: "volatile",
        title: "🎢 Chaos Engine",
        team: mostVolatile.team,
        desc: `Volatility: ${mostVolatile.vol.toFixed(1)}.`,
      },

      {
        id: "ducks",
        title: "🦆 Duck Collector",
        team: mostDucks.team,
        desc: `${mostDucks.zeros} zero-score matches.`,
      },

      {
        id: "comeback",
        title: "🚀 Biggest Comeback",
        team: biggestComeback.team,
        desc: `+${biggestComeback.delta} jump on ${biggestComeback.day}`,
      },

      {
        id: "mvp",
        title: "🔥 Today’s MVP",
        team: dailyHigh.team,
        desc: `${dailyHigh.points} points.`,
        highlight: true,
      },

      {
        id: "victim",
        title: "💀 Today’s Victim",
        team: dailyLow.team,
        desc: `${dailyLow.points} points.`,
        highlight: true,
      },
    ];

    const cardsWithRoast = rawCards.map((card) => {
      const pts = extractPoints(card.desc);

      const roast =
        card.id === "mvp"
          ? aiAgent.praise(card.team, pts)
          : card.id === "consistent"
            ? aiAgent.consistency(card.team, pts)
            : card.id === "comeback"
              ? aiAgent.surge(card.team, pts, card.desc)
              : card.id === "fail" || card.id === "victim"
                ? aiAgent.roast(card.team, pts)
                : aiAgent.roast(card.team, pts);

      return {
        ...card,
        roast,
      };
    });

    return {
      cards: shuffle(cardsWithRoast),
    };
  }, [data, historicalData]);

  return (
    <motion.section
      layout
      className="relative w-full p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {" "}
      <div className="mb-10">
        {" "}
        <h2 className="text-3xl font-bold text-white">
          🧠 Season Summary{" "}
        </h2>{" "}
        <p className="text-slate-400 mt-2">
          AI-generated insights from {matchCount} matches{" "}
        </p>{" "}
      </div>
      <motion.div
        layout
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id} // ✅ stable key
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 120,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 25px rgba(139,92,246,0.3)",
            }}
            className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
              card.highlight
                ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30"
                : "bg-white/5 border-white/10"
            }`}
          >
            <p className="text-[10px] uppercase text-slate-400">{card.title}</p>

            <p className="mt-1 text-base font-semibold text-white truncate">
              {card.team}
            </p>

            <p className="text-xs text-slate-300 mt-1">{card.desc}</p>
            <p className="text-[11px] mt-2 italic text-purple-300">
              {card.roast}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
