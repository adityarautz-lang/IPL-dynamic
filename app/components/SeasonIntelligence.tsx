"use client";

import {
  useEffect,
  useState,
} from "react";

export default function SeasonIntelligence({
  insights,
}: {
  insights: string[];
}) {
  const [index, setIndex] =
    useState(0);

  useEffect(() => {
    const interval =
      setInterval(() => {
        setIndex(
          (i) =>
            (i + 1) %
            insights.length
        );
      }, 8000);

    return () =>
      clearInterval(interval);
}, []);

  if (!insights?.length)
    return null;

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)] p-5">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_55%)] pointer-events-none" />

        <div className="relative z-10">
          <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
            SEASON INTELLIGENCE
          </div>

          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
            🧠 AI Season Insights
          </h2>

          <div className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed min-h-[80px] transition-all duration-500">
            {insights[index]}
          </div>

          <div className="flex gap-2 mt-5">
            {insights.map(
              (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-cyan-300"
                      : "w-2 bg-white/20"
                  }`}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}