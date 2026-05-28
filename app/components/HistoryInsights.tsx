"use client";

import { computeHistoryMetrics } from "../utils/computeHistoryMetrics";

export default function HistoryInsights({
  history,
}: any) {
  const metrics =
    computeHistoryMetrics(history);

  if (!metrics) return null;

  const topScores = [
    metrics.highest,
    ...metrics.topScores.slice(0, 4),
  ]
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.points - a.points
    )
    .slice(0, 5);

  return (
    <div className="mt-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(15,23,42,0.5)] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-white/5">
          <div>
            <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
              PLAYOFF RECORDS
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white">
              🔥 Highest Match Scores
            </h2>
          </div>

          <div className="hidden sm:block text-xs text-slate-500">
            Top 5 individual match performances
          </div>
        </div>

        {/* TABLE */}
        <div className="divide-y divide-white/5">
          {topScores.map(
            (
              item: any,
              idx: number
            ) => (
              <div
                key={`${item.team}-${item.match}`}
                className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-white/[0.03] transition-all"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  {/* RANK */}
                  <div className="w-9 h-9 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 font-bold text-sm">
                    #{idx + 1}
                  </div>

                  {/* TEAM */}
                  <div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {item.team}
                    </div>

                    <div className="text-slate-400 text-xs sm:text-sm">
                      Match{" "}
                      {item.match}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-200 to-violet-300 bg-clip-text text-transparent">
                    {item.points}
                  </div>

                  <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.25em]">
                    points
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}