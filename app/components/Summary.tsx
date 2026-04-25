"use client";

import RoastDisplay from "./RoastDisplay";

export default function Summary({ data }: { data: any[] }) {
  const list = Array.isArray(data) ? data : [];

  const topPerformer =
    list.length > 0
      ? [...list].sort(
          (a, b) =>
            (b.lastMatchPoints || 0) - (a.lastMatchPoints || 0)
        )[0]
      : null;

  return (
    <div>
      {/* 🥇 Top Performer */}
      {topPerformer && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="text-sm text-green-400 font-semibold">
            🥇 Top Performer (Today)
          </div>

          <div className="text-lg font-bold text-white mt-1">
            {topPerformer.name}
          </div>

          <div className="text-sm text-slate-300">
            {topPerformer.lastMatchPoints} pts
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Captain: {topPerformer.captain?.name || "—"}
          </div>
        </div>
      )}

      {/* 🔥 AI Roasts */}
      <RoastDisplay />
    </div>
  );
}