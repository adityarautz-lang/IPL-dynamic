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
    <div className="mt-2 text-sm text-slate-300 animate-pulse">
      🔥 Today’s top performer:{" "}
      <span className="font-semibold text-yellow-400">
        {top.name}
      </span>{" "}
      (
      <span className="font-semibold text-white">
        {Math.round(top.lastMatchPoints)} pts
      </span>
      )
    </div>
  );
}