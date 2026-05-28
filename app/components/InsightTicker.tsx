"use client";

export default function InsightTicker({
  insights,
}: {
  insights: string[];
}) {
  if (!insights?.length)
    return null;

  const text =
    insights.join(
      "   ✦   "
    );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] backdrop-blur-2xl py-3">
      
      {/* GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_60%)] pointer-events-none" />

      {/* SCROLL */}
      <div className="whitespace-nowrap animate-marquee text-sm text-cyan-100 font-medium tracking-wide px-4">
  🧠 {text} ✦ 🧠 {text}
</div>
    </div>
  );
}