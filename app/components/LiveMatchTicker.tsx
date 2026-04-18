"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { matches } from "../lib/matches";

export default function LiveMatchTicker() {
  const [now, setNow] = useState(new Date());

  // ⏱️ live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🎯 next matches
  const upcoming = matches
    .filter((m) => new Date(m.date) > now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 5);

  const tickerData = [...upcoming, ...upcoming];

  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2">
      {/* ✅ Clock (takes real space) */}
      <div className="text-xs text-slate-300 whitespace-nowrap min-w-17.5">
        {now.toLocaleTimeString()}
      </div>

      {/* 🎞️ Ticker wrapper */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
        >
          {tickerData.map((match, i) => (
            <div key={`${match.id}-${i}`} className="flex items-center gap-3">
              <span className="text-xs text-white font-medium">
                {match.team1} vs {match.team2}
              </span>

              <span className="text-[11px] text-slate-400">
                {new Date(match.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="text-slate-600">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
