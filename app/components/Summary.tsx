"use client";

import { useMemo } from "react";
import type { DashboardData } from "../types";

const formatNumber = (value: number) => value.toLocaleString();

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
      `If this were a movie, ${highestSingle.team} would be the overpaid superstar with a ${highestSingle.points}-point “one-hit wonder” in ${highestSingle.day}.`,
      `${lowestSingle.team} in ${lowestSingle.day} wasn’t a performance, it was a cautionary tale.`,
      `${mostConsistent.team} is so consistent it’s honestly suspicious.`,
      `${mostImproved.team} went from ${mostImproved.firstMatch} to ${mostImproved.lastMatch} — finally decided to play, apparently.`,
      `${bestSurge.team} randomly remembered how to score and jumped ${bestSurge.delta} points in ${bestSurge.day}.`,
      `${biggestSlide.team} dropped ${Math.abs(biggestSlide.delta)} points in ${biggestSlide.day} — gravity working overtime.`,
      `${mostZeros.team} dominating the zero leaderboard with ${mostZeros.zeroCount} matches. Elite stuff.`,
    ],

    commentator: [
      `What a knock by ${highestSingle.team}! ${highestSingle.points} points in ${highestSingle.day}, absolute scenes.`,
      `Tough outing for ${lowestSingle.team} in ${lowestSingle.day}, nothing really clicked.`,
      `${mostConsistent.team} showing incredible discipline across the season.`,
      `${mostImproved.team} building momentum beautifully from ${mostImproved.firstMatch} to ${mostImproved.lastMatch}.`,
      `${bestSurge.team} with a massive swing of ${bestSurge.delta} points in ${bestSurge.day}!`,
      `${biggestSlide.team} will be disappointed with that ${Math.abs(biggestSlide.delta)} drop in ${biggestSlide.day}.`,
      `${mostZeros.team} struggled for impact with ${mostZeros.zeroCount} low-return games.`,
    ],

    meme: [
      `${highestSingle.team} in ${highestSingle.day}: “fine, I’ll do it myself” (${highestSingle.points} pts)`,
      `${lowestSingle.team} in ${lowestSingle.day}: task failed successfully`,
      `${mostConsistent.team}: built different. Or just… never changes.`,
      `${mostImproved.team}: glow-up from ${mostImproved.firstMatch} → ${mostImproved.lastMatch}`,
      `${bestSurge.team}: stonks ↑ (+${bestSurge.delta} in ${bestSurge.day})`,
      `${biggestSlide.team}: stonks ↓ (${Math.abs(biggestSlide.delta)} drop in ${biggestSlide.day})`,
      `${mostZeros.team}: speedrunning zeroes (${mostZeros.zeroCount} times)`,
    ],
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
    <section className="w-full mt-10 p-6 rounded-3xl bg-linear-to-br from-slate-800/90 via-slate-900/80 to-slate-950/95 shadow-2xl border border-white/10 backdrop-blur-2xl">
      <div className="relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-linear-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent mb-2 tracking-wide">
            🧠 Season Summary
          </h2>
          <p className="text-slate-400 max-w-2xl">
            Creative insights from the full {matchCount}-match series — from the
            flashiest single-match storm to the steadiest season-long grind.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Single-match king
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {highestSingle.team}
            </p>
            <p className="mt-2 text-slate-300">
              {highestSingle.points} points in {highestSingle.day}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Hardest crash
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {lowestSingle.team}
            </p>
            <p className="mt-2 text-slate-300">
              {lowestSingle.points} points in {lowestSingle.day}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Most reliable
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {mostConsistent.team}
            </p>
            <p className="mt-2 text-slate-300">
              avg {formatNumber(Number(mostConsistent.average.toFixed(1)))} pts,
              volatility{" "}
              {formatNumber(Number(mostConsistent.volatility.toFixed(1)))}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Season pace-setter
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {bestAverage.team}
            </p>
            <p className="mt-2 text-slate-300">
              avg {formatNumber(Number(bestAverage.average.toFixed(1)))} pts /
              match
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Biggest momentum
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {bestSurge.team}
            </p>
            <p className="mt-2 text-slate-300">
              +{bestSurge.delta} in {bestSurge.day}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Greatest wobble
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {biggestSlide.team}
            </p>
            <p className="mt-2 text-slate-300">
              {Math.abs(biggestSlide.delta)} drop in {biggestSlide.day}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Most improved
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {mostImproved.team}
            </p>
            <p className="mt-2 text-slate-300">
              +{mostImproved.lastMatch - mostImproved.firstMatch} vs first match
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Zero hero (not really)
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {mostZeros.team}
            </p>
            <p className="mt-2 text-slate-300">
              {mostZeros.zeroCount} matches with zero points — MVP of the bench.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {funPhrases.map((phrase, index) => (
            <div
              key={index}
              className="rounded-3xl bg-slate-900/80 p-5 ring-1 ring-violet-500/10"
            >
              <p className="text-slate-200 leading-7">{phrase}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
