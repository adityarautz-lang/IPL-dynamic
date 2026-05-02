"use client";

import { computeHistoryMetrics } from "../utils/computeHistoryMetrics";

export default function HistoryInsights({ history }: any) {
  const metrics = computeHistoryMetrics(history);

  if (!metrics) return null;

  const Card = ({ title, value, sub }: any) => (
    <div className="
      rounded-xl 
      border border-white/10 
      bg-white/5 
      backdrop-blur-xl 
      px-3 py-2 sm:p-4
    ">
      <div className="text-[10px] sm:text-xs text-slate-400 leading-tight">
        {title}
      </div>

      <div className="text-[12px] sm:text-base font-bold text-white mt-[2px] truncate">
        {value}
      </div>

      {sub && (
        <div className="text-[9px] sm:text-xs text-slate-400 mt-[2px] truncate">
          {sub}
        </div>
      )}
    </div>
  );

  return (
    <div className="
      grid 
      grid-cols-2 
      sm:grid-cols-2 
      md:grid-cols-4 
      gap-2 sm:gap-4 
      mt-4
    ">
      <Card
        title="🏆 Top Finishes"
        value={metrics.maxTopper.team}
        sub={`${metrics.maxTopper.count} times`}
      />

      <Card
        title="🪵 Bottom Finishes"
        value={metrics.maxBottom.team}
        sub={`${metrics.maxBottom.count} times`}
      />

      <Card
        title="🔥 Highest"
        value={metrics.highest.points}
        sub={`M${metrics.highest.match}`}
      />

      <Card
        title="❄️ Lowest"
        value={metrics.lowest.points}
        sub={`M${metrics.lowest.match}`}
      />
    </div>
  );
}