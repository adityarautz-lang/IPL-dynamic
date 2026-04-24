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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-4 space-y-4 sm:space-y-5">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
          Who's your captain today?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Quick snapshot of captain picks across teams
        </p>
      </div>

      {/* Popular Captain Choice */}
      <div>
        <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-2">
          Popular Captain Choice
        </h3>

        <div className="flex gap-2 flex-wrap">
          {captainStats.map((c) => (
            <div
              key={c.name}
              className="glass-card px-2 py-1 text-xs sm:text-sm text-slate-200"
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
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams
          .sort((a, b) => a.rank - b.rank)
          .map((t) => (
            <div
              key={t.name}
              className="glass-card p-3 sm:p-4 hover:scale-[1.02] transition-all"
            >
              {/* Team Header */}
              <div className="font-semibold text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3">
                #{t.rank} {t.name}
              </div>

              {/* Players */}
              <div className="space-y-2 sm:space-y-3">
                
                {/* Captain */}
                <div className="flex justify-between items-center text-yellow-300">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={t.captain?.image}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10"
                    />
                    <span className="text-xs sm:text-sm font-medium">
                      {t.captain?.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">
                    {t.captain?.points}
                  </span>
                </div>

                {/* Vice Captain */}
                <div className="flex justify-between items-center text-blue-300">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={t.viceCaptain?.image}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10"
                    />
                    <span className="text-xs sm:text-sm font-medium">
                      {t.viceCaptain?.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">
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