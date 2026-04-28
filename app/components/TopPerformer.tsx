"use client";

import ProgressBar from "./ProgressBar";

export default function TopPerformer({
  data,
  completedPct,
  completedMatches,
}: {
  data: any[];
  completedPct?: number;
  completedMatches?: number;
}) {
  const list = Array.isArray(data) ? data : [];

  const top =
    list.length > 0
      ? [...list].sort(
          (a, b) =>
            (b.lastMatchPoints || 0) - (a.lastMatchPoints || 0)
        )[0]
      : null;

  if (!top) return null;

  return (
    <div className="mt-2 w-full">
      {/* 🔥 Top Performer */}
      <div className="text-sm text-slate-300 animate-pulse">
        🔥 Today’s top performer:{" "}
        <span className="font-semibold text-white">
          {top.name}
        </span>{" "}
        (<span className="text-green-400 font-semibold">
          {top.lastMatchPoints}
        </span>{" "}
        pts)
      </div>

      {/* 📊 Progress Bar */}
      <ProgressBar
        completedPct={completedPct}
        completedMatches={completedMatches}
      />
    </div>
  );
}