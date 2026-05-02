"use client";

import { computeHistoryMetrics } from "../utils/computeHistoryMetrics";

export default function HistoryInsights({ history }: any) {
  const metrics = computeHistoryMetrics(history);

  if (!metrics) return null;

  const Card = ({ title, value, sub }: any) => (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="text-sm sm:text-base font-bold text-white mt-1">
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-400 mt-1">{sub}</div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
      <Card
        title="🏆 Most Top Finishes"
        value={metrics.maxTopper.team}
        sub={`${metrics.maxTopper.count} times`}
      />

      <Card
        title="🪵 Most Bottom Finishes"
        value={metrics.maxBottom.team}
        sub={`${metrics.maxBottom.count} times`}
      />

      <Card
        title="🔥 Highest Score"
        value={metrics.highest.points}
        sub={`${metrics.highest.team} • Match ${metrics.highest.match}`}
      />

      <Card
        title="❄️ Lowest Score"
        value={metrics.lowest.points}
        sub={`${metrics.lowest.team} • Match ${metrics.lowest.match}`}
      />
    </div>
  );
}