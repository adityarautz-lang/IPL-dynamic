"use client";

export default function TeamCards({
  teams,
}: {
  teams: any[];
}) {
  const counts: Record<
    string,
    number
  > = {};

  teams.forEach((t) => {
    if (!t.captain?.name)
      return;

    counts[t.captain.name] =
      (counts[t.captain.name] ||
        0) + 1;
  });

  const total = teams.length;

  const captainStats =
    Object.entries(counts)
      .map(([name, count]) => ({
        name,

        percentage: (
          (count / total) *
          100
        ).toFixed(1),
      }))
      .sort(
        (a, b) =>
          Number(
            b.percentage
          ) -
          Number(
            a.percentage
          )
      );

  return (
    <div className="mt-6">
      {/* OUTER CONTAINER */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        
        {/* INNER GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_55%)] pointer-events-none" />

        {/* EDGE LIGHT */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/[0.03] pointer-events-none" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
          
          {/* HEADER */}
          <div>
            <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
              CAPTAIN ANALYTICS
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-none bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
              🎯 Captain Intelligence
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-3">
              Quick snapshot of
              captain picks across
              playoff teams
            </p>
          </div>

          {/* POPULAR CAPTAINS */}
          <div>
            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">
              MOST OWNED CAPTAINS
            </h3>

            <div className="flex gap-2 flex-wrap">
              {captainStats.map(
                (c) => (
                  <div
                    key={c.name}
                    className="px-3 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/[0.04] backdrop-blur-xl text-xs sm:text-sm text-slate-200 shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] transition-all"
                  >
                    <span className="font-medium text-white">
                      {c.name}
                    </span>

                    <span className="text-cyan-300 ml-1">
                      {
                        c.percentage
                      }
                      %
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-white/5" />

          {/* TEAM CARDS */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams
              .sort(
                (
                  a,
                  b
                ) =>
                  a.rank -
                  b.rank
              )
              .map((t) => (
                <div
                  key={t.name}
                  className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-white/[0.035] backdrop-blur-xl p-4 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03] hover:scale-[1.015] transition-all duration-300"
                >
                  {/* CARD GLOW */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.03),transparent_60%)] pointer-events-none" />

                  {/* TEAM HEADER */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="font-semibold text-sm text-slate-200">
                      #
                      {t.rank}{" "}
                      {
                        t.name
                      }
                    </div>

                    <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/10">
                      PLAYOFF
                    </div>
                  </div>

                  {/* PLAYERS */}
                  <div className="relative z-10 space-y-3">
                    
                    {/* CAPTAIN */}
                    <div className="flex justify-between items-center text-yellow-300">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full border border-white/10 bg-cover bg-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.08)]"
                          style={{
                            backgroundImage: `url(${t.captain?.image})`,
                          }}
                        />

                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-0.5">
                            Captain
                          </div>

                          <div className="text-sm font-medium text-yellow-300 truncate">
                            {
                              t.captain
                                ?.name
                            }
                          </div>
                        </div>
                      </div>

                      <div className="text-lg font-black text-yellow-300">
                        {
                          t.captain
                            ?.points
                        }
                      </div>
                    </div>

                    {/* VICE CAPTAIN */}
                    <div className="flex justify-between items-center text-blue-300">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full border border-white/10 bg-cover bg-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.08)]"
                          style={{
                            backgroundImage: `url(${t.viceCaptain?.image})`,
                          }}
                        />

                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-0.5">
                            Vice Captain
                          </div>

                          <div className="text-sm font-medium text-blue-300 truncate">
                            {
                              t
                                .viceCaptain
                                ?.name
                            }
                          </div>
                        </div>
                      </div>

                      <div className="text-lg font-black text-blue-300">
                        {
                          t
                            .viceCaptain
                            ?.points
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}