"use client";

export default function ProgressBar({
  completedPct,
  completedMatches,
  totalMatches = 70,
}: {
  completedPct?: number;
  completedMatches?: number;
  totalMatches?: number;
}) {
  // 🧪 Debug visibility (temporary)
  if (
    typeof completedPct !== "number" ||
    typeof completedMatches !== "number"
  ) {
    return (
      <div className="text-xs text-red-400 mt-1">
        ProgressBar: missing data
      </div>
    );
  }

  const pct = Math.round(completedPct);

  return (
    <div className="w-full mt-1 mb-2">
      <div className="flex justify-between text-[12px] text-slate-400 mb-1">
        <span>
          Season Progress (League stage) • {completedMatches}/{totalMatches}
        </span>
        <span>{pct}%</span>
      </div>

      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}