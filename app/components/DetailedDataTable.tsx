"use client";

import type { Leader } from "../types";

export default function DetailedDataTable({
  data,
  history,
}: {
  data?: Leader[];
  history?: any;
}) {
  const list = Array.isArray(data)
    ? data
    : [];

  if (!list.length) {
    return (
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_55%)] pointer-events-none" />

          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/[0.03] pointer-events-none" />

          <div className="relative z-10 p-4 sm:p-6">
            <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
              LEADERBOARD
            </div>

            <h2 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
              📋 Detailed
              Leaderboard
            </h2>

            <p className="text-slate-400 text-sm mt-3">
              No data available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...list]
    .map((d) => ({
      ...d,

      points: Number(
        d.points ?? 0
      ),

      lastMatchPoints: Number(
        d.lastMatchPoints ??
          0
      ),

      transfersLeft: Number(
        d.transfersLeft ??
          0
      ),
    }))
    .sort(
      (a, b) =>
        (a.rank ?? 999) -
        (b.rank ?? 999)
    );

  // =====================================
  // 🔥 PREVIOUS RANKS
  // =====================================
  const buildRankForMatch = (
    matchIndex: number
  ) => {
    return history.teams
      .map((t: any) => {
        const total =
          t.history
            .slice(
              0,
              matchIndex + 1
            )
            .reduce(
              (
                sum: number,
                m: any
              ) =>
                sum +
                (m.points ||
                  0),

              0
            );

        return {
          name: t.teamName,

          points: total,
        };
      })
      .sort(
        (a: any, b: any) =>
          b.points - a.points
      )
      .map(
        (
          t: any,
          idx: number
        ) => ({
          name: t.name,

          rank: idx + 1,
        })
      );
  };

  const getPrevRanks = () => {
    if (!history?.teams)
      return {};

    const prevRanks: Record<
      string,
      number
    > = {};

    const lastMatchIndex =
      history.teams[0]
        ?.history?.length - 1;

    if (lastMatchIndex < 1)
      return {};

    const prevRanking =
      buildRankForMatch(
        lastMatchIndex - 1
      );

    prevRanking.forEach(
      (t: any) => {
        prevRanks[
          t.name
            .toLowerCase()
            .trim()
        ] = t.rank;
      }
    );

    return prevRanks;
  };

  const prevRanks =
    getPrevRanks();

  return (
    <div className="mt-6">
      {/* OUTER WRAPPER */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">

        {/* INNER GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_55%)] pointer-events-none" />

        {/* EDGE LIGHT */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/[0.03] pointer-events-none" />

        <div className="relative z-10 p-3 sm:p-6">
          
          {/* HEADER */}
          <div className="mb-4">
            <div className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-2">
              LEADERBOARD
            </div>

            <h2 className="text-xl sm:text-3xl font-black leading-none bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
              📋 Detailed
              Leaderboard
            </h2>
          </div>

          {/* TABLE WRAPPER */}
          <div className="relative overflow-x-auto rounded-2xl border border-cyan-400/10 bg-white/[0.02]">
            <table className="w-full text-[9px] sm:text-sm text-left border-collapse">
              
              {/* HEADER */}
              <thead className="bg-cyan-400/[0.04] backdrop-blur-xl">
                <tr>
                  <th className="px-1.5 sm:px-4 py-2 text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    Rk
                  </th>

                  <th className="px-1.5 sm:px-4 py-2 text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    Name
                  </th>

                  <th className="px-1.5 sm:px-4 py-2 text-center text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    Pts
                  </th>

                  <th className="px-1.5 sm:px-4 py-2 text-center text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    LM
                  </th>

                  <th className="px-1.5 sm:px-4 py-2 text-center text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    Tr
                  </th>

                  <th className="px-1.5 sm:px-4 py-2 text-center text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    Bst
                  </th>

                  <th className="px-1.5 sm:px-4 py-2 text-center text-cyan-100 font-semibold tracking-wide border-b border-white/5">
                    Eff
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {sorted.map(
                  (
                    row,
                    idx
                  ) => {
                    const rank =
                      row.rank ??
                      idx + 1;

                    const transfersLeft =
                      row.transfersLeft ??
                      0;

                    const usedTransfers =
                      Math.max(
                        0,
                        160 -
                          transfersLeft
                      );

                    const efficiency =
                      usedTransfers >
                      0
                        ? (
                            row.points /
                            usedTransfers
                          ).toFixed(
                            2
                          )
                        : "–";

                    const efficiencyNum =
                      Number(
                        efficiency
                      );

                    const key =
                      row.name
                        .toLowerCase()
                        .trim();

                    const prevRank =
                      prevRanks[
                        key
                      ];

                    const movement =
                      prevRank !==
                      undefined
                        ? prevRank -
                          rank
                        : 0;

                    return (
                      <tr
                        key={
                          row.name +
                          idx
                        }
                        className={`border-b border-white/[0.04] transition-all ${
                          rank <= 3
                            ? "bg-gradient-to-r from-emerald-500/[0.08] to-transparent hover:from-emerald-500/[0.12]"
                            : rank <= 5
                            ? "bg-gradient-to-r from-cyan-500/[0.07] to-transparent hover:from-cyan-500/[0.10]"
                            : "bg-gradient-to-r from-red-500/[0.05] to-transparent hover:from-red-500/[0.08]"
                        }`}
                      >
                        {/* RANK */}
                        <td className="px-1.5 sm:px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            {rank <=
                              3 && (
                              <div
                                className={`w-1 h-6 rounded-full ${
                                  rank ===
                                  1
                                    ? "bg-emerald-400"
                                    : rank ===
                                      2
                                    ? "bg-slate-300"
                                    : "bg-orange-400"
                                }`}
                              />
                            )}

                            <div className="flex items-center gap-1">
                              {rank ===
                                1 &&
                                "🏆"}

                              {rank ===
                                2 &&
                                "🥈"}

                              {rank ===
                                3 &&
                                "🥉"}

                              <span className="text-white font-medium">
                                {
                                  rank
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* NAME */}
                        <td className="px-1.5 sm:px-4 py-2.5 font-medium text-white max-w-[90px] sm:max-w-[140px] truncate">
                          <div className="flex items-center gap-1">
                            <span className="truncate">
                              {
                                row.name
                              }
                            </span>

                            {movement >
                              0 && (
                              <span className="text-green-400 text-[10px]">
                                ⬆️
                              </span>
                            )}

                            {movement <
                              0 && (
                              <span className="text-red-400 text-[10px]">
                                ⬇️
                              </span>
                            )}
                          </div>
                        </td>

                        {/* POINTS */}
                        <td className="px-1.5 sm:px-4 py-2.5 text-center text-white">
                          {row.points.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* LAST MATCH */}
                        <td className="px-1.5 sm:px-4 py-2.5 text-center text-white">
                          {row.lastMatchPoints ||
                            "-"}
                        </td>

                        {/* TRANSFERS */}
                        <td className="px-1.5 sm:px-4 py-2.5 text-center text-white">
                          {
                            transfersLeft
                          }
                        </td>

                        {/* BOOSTERS */}
                        <td className="px-1.5 sm:px-4 py-2.5 text-center text-white">
                          {row.boostersUsed ??
                            "-"}
                        </td>

                        {/* EFFICIENCY */}
                        <td
                          className={`px-1.5 sm:px-4 py-2.5 text-center font-bold ${
                            efficiency ===
                            "–"
                              ? "text-slate-400"
                              : efficiencyNum >
                                150
                              ? "text-emerald-400"
                              : efficiencyNum >
                                120
                              ? "text-cyan-300"
                              : "text-slate-400"
                          }`}
                        >
                          {
                            efficiency
                          }
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="hidden sm:flex flex-wrap gap-5 mt-5 text-[10px] sm:text-xs text-slate-500">
            <div>
              Pts: Points
            </div>

            <div>
              • LM: Last Match
            </div>

            <div>
              • Tr: Transfers
            </div>

            <div>
              • Bst: Boosters
            </div>

            <div>
              • Eff:
              Efficiency
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}