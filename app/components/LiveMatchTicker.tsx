"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { matches } from "../lib/matches";

function getMatchStatus(date: string) {
  const now = new Date().getTime();
  const matchTime = new Date(date).getTime();

  const diff = matchTime - now;

  if (diff < -4 * 60 * 60 * 1000) return "ENDED";
  if (diff <= 0) return "LIVE";
  if (diff <= 30 * 60 * 1000) return "SOON";

  return "UPCOMING";
}

export default function LiveMatchTicker() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const relevantMatches = matches
    .map((m) => ({
      ...m,
      status: getMatchStatus(m.date),
    }))
    .filter((m) => m.status !== "ENDED")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 4);

  const tickerData = [
    ...relevantMatches,
    ...relevantMatches,
    ...relevantMatches,
  ];

  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/60 border-b border-white/10">
      {/* Gradient fade edges (broadcast feel) */}
      <div className="relative w-full overflow-hidden">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-linear-to-r from-black/80 to-transparent z-10" />

        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-linear-to-l from-black/80 to-transparent z-10" />

        <div className="flex flex-col text-xs text-slate-300">
          {/* 🔝 Top Row → Date + Time */}
          <div className="flex items-center justify-between px-3 py-1 border-b border-white/10 text-slate-400">
            {/* 📅 Date */}
            <span>
              {now.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </span>

            {/* 🕒 Time */}
            <span>
              {now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          {/* 🎞️ Bottom Row → Ticker */}
          <div className="flex items-center">
            <div className="flex-1 overflow-hidden">
              <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 40,
                  ease: "linear",
                }}
              >
                {tickerData.map((match, i) => {
                  return (
                    <div
                      key={`${match.id}-${i}`}
                      className="flex flex-col px-4 py-1 min-w-35"
                    >
                      {/* Teams */}
                      <span className="text-white leading-tight">
                        {match.team1} vs {match.team2}
                      </span>

                      {/* Date + Time */}
                      <span className="text-[10px] text-slate-500">
                        {new Date(match.date).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        •{" "}
                        {new Date(match.date).toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
