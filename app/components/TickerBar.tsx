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

function getTimeLeft(date: string) {
  const now = new Date().getTime();
  const matchTime = new Date(date).getTime();
  const diff = matchTime - now;

  if (diff <= 0) return "";

  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);

  return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
}

export default function TickerBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const relevantMatches = matches
    .map((m) => ({ ...m, status: getMatchStatus(m.date) }))
    .filter((m) => m.status !== "ENDED")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 10);

  const tickerData = [
    ...relevantMatches,
    ...relevantMatches,
    ...relevantMatches,
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="relative w-full overflow-hidden">
        {/* edge fades */}
        <div className="absolute left-0 top-0 h-full w-10 bg-linear-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 h-full w-10 bg-linear-to-l from-black to-transparent z-10" />

        <div className="flex items-center text-[11px] text-slate-300">
          {/* clock */}
          <div className="px-3 text-slate-400 border-r border-white/10 whitespace-nowrap">
            {now.toLocaleTimeString()}
          </div>

          {/* ticker */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                duration: 45,
                ease: "linear",
              }}
            >
              {tickerData.map((match, i) => {
                const status = getMatchStatus(match.date);

                return (
                  <div
                    key={`${match.id}-${i}`}
                    className="flex items-center gap-2 px-4"
                  >
                    <span className="text-white">
                      {match.team1} vs {match.team2}
                    </span>

                    <span className="text-slate-500">
                      {new Date(match.date).toLocaleTimeString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <span
                      className={`text-[10px] ${
                        status === "LIVE"
                          ? "text-red-400 animate-pulse"
                          : status === "SOON"
                            ? "text-yellow-400"
                            : "text-blue-400"
                      }`}
                    >
                      {status}
                    </span>

                    {status === "UPCOMING" && (
                      <span className="text-slate-600">
                        {getTimeLeft(match.date)}
                      </span>
                    )}

                    {status === "LIVE" && (
                      <span className="text-red-500">●</span>
                    )}

                    <span className="text-slate-700">•</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
