"use client";

export default function TeamCards({ teams }: { teams: any[] }) {
  const counts: Record<string, number> = {};

  teams.forEach((t) => {
    if (!t.captain?.name) return;
    counts[t.captain.name] = (counts[t.captain.name] || 0) + 1;
  });

  const total = teams.length;

  const captainStats = Object.entries(counts)
    .map(([name, count]) => ({
      name,
      percentage: ((count / total) * 100).toFixed(1),
    }))
    .sort((a, b) => Number(b.percentage) - Number(a.percentage));

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Who's your captain today?
        </h2>
        <p className="text-sm text-slate-400">
          Quick snapshot of captain picks across teams
        </p>
      </div>

      {/* Popular Captain Choice */}
      <div>
        <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">
          Popular Captain Choice
        </h3>

        <div className="flex gap-2 flex-wrap">
          {captainStats.map((c) => (
            <div
              key={c.name}
              className="glass-card px-3 py-1.5 text-sm text-slate-200"
            >
              {c.name}{" "}
              <span className="text-slate-400">{c.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teams
          .sort((a, b) => a.rank - b.rank)
          .map((t) => (
            <div
              key={t.name}
              className="glass-card p-5 hover:scale-[1.02] transition-all"
            >
              {/* Team Header */}
              <div className="font-semibold text-sm text-slate-300 mb-4">
                #{t.rank} {t.name}
              </div>

              {/* Players */}
              <div className="space-y-3">
                
                {/* Captain */}
                <div className="flex justify-between items-center text-yellow-300">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.captain?.image}
                      className="w-10 h-10 rounded-full border border-white/10"
                    />
                    <span className="text-sm font-medium">
                      {t.captain?.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {t.captain?.points}
                  </span>
                </div>

                {/* Vice Captain */}
                <div className="flex justify-between items-center text-blue-300">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.viceCaptain?.image}
                      className="w-10 h-10 rounded-full border border-white/10"
                    />
                    <span className="text-sm font-medium">
                      {t.viceCaptain?.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {t.viceCaptain?.points}
                  </span>
                </div>

              </div>
            </div>
          ))}
      </div>
    </div>
  );
}