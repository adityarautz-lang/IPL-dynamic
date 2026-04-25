"use client";

export default function TopPerformer({ data }: { data: any[] }) {
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
    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
      <div className="text-sm text-green-400 font-semibold">
        🥇 Today's killer performer
      </div>

      <div className="text-lg font-bold text-white mt-1">
        {top.name}
      </div>

      <div className="text-sm text-slate-300">
        {top.lastMatchPoints} pts
      </div>

      {/* <div className="text-xs text-slate-400 mt-1">
        Captain: {top.captain?.name || "—"}
      </div> */}
    </div>
  );
}