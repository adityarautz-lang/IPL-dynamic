"use client";

import { motion } from "framer-motion";
import { computeHistoryMetrics } from "../utils/computeHistoryMetrics";

export default function HistoryInsights({ history }: any) {
  const metrics = computeHistoryMetrics(history);

  if (!metrics) return null;

  const Card = ({ title, value, sub, glow }: any) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`
        relative 
        rounded-xl 
        border border-white/10 
        bg-white/5 
        p-4 
        backdrop-blur-xl 
        shadow-md 
        overflow-hidden
      `}
    >
      {/* subtle glow layer */}
      <div
        className={`absolute inset-0 opacity-20 blur-2xl ${glow}`}
      />

      {/* content */}
      <div className="relative z-10">
        <div className="text-xs text-slate-400 tracking-wide">
          {title}
        </div>

        <div className="text-base font-bold text-white mt-1 truncate">
          {value}
        </div>

        {sub && (
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Card
        title="🏆 Most Top Finishes"
        value={metrics.maxTopper.team}
        sub={`${metrics.maxTopper.count} times`}
        glow="bg-green-500"
      />

      <Card
        title="🪵 Most Bottom Finishes"
        value={metrics.maxBottom.team}
        sub={`${metrics.maxBottom.count} times`}
        glow="bg-red-500"
      />

      <Card
        title="🔥 Highest Score"
        value={metrics.highest.points}
        sub={`${metrics.highest.team} • Match ${metrics.highest.match}`}
        glow="bg-orange-500"
      />

      <Card
        title="❄️ Lowest Score"
        value={metrics.lowest.points}
        sub={`${metrics.lowest.team} • Match ${metrics.lowest.match}`}
        glow="bg-blue-500"
      />
    </div>
  );
}