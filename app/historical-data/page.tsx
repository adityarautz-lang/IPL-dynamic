"use client";

import { useEffect, useState } from "react";

type Match = {
  matchIndex: number;
  matchName: string;
  points: number;
  captain: string;
  vc: string;
};

type Team = {
  teamName: string;
  matches: Match[];
};

type StandingRow = {
  match: number;
  table: {
    team: string;
    rank: number;
    points: number;
  }[];
};

export default function HistoricalDataPage() {
  const [data, setData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMatch, setCurrentMatch] = useState(1);

  // ----------------------------------
  // 📡 Fetch data
  // ----------------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ipl");
        const json = await res.json();
        setData(json.leagueData || []);
      } catch (e) {
        console.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ----------------------------------
  // 🧠 Compute standings
  // ----------------------------------
  const getStandings = (leagueData: Team[]): StandingRow[] => {
    if (!leagueData.length) return [];

    const totals: Record<string, number> = {};
    const standings: StandingRow[] = [];

    leagueData.forEach((team) => {
      totals[team.teamName] = 0;
    });

    const totalMatches = leagueData[0].matches.length;

    for (let i = totalMatches; i >= 1; i--) {
      leagueData.forEach((team) => {
        const match = team.matches.find((m) => m.matchIndex === i);
        totals[team.teamName] += match?.points || 0;
      });

      const ranking = Object.entries(totals)
        .map(([team, pts]) => ({
          team,
          points: pts,
        }))
        .sort((a, b) => b.points - a.points)
        .map((t, idx) => ({
          team: t.team,
          rank: idx + 1,
          points: t.points,
        }));

      standings.push({
        match: totalMatches - i + 1,
        table: ranking,
      });
    }

    return standings;
  };

  const standings = getStandings(data);

  // ----------------------------------
  // ⏱️ Animation loop
  // ----------------------------------
  useEffect(() => {
    if (!standings.length) return;

    const interval = setInterval(() => {
      setCurrentMatch((prev) => {
        if (prev >= standings.length) return 1;
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [standings]);

  // ----------------------------------
  // ⛔ Loading
  // ----------------------------------
  if (loading) return <div className="p-6">Loading...</div>;
  if (!data.length) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">
        📊 Historical Data
      </h1>

      {/* -------------------------------- */}
      {/* 🔹 RAW DATA TABLE */}
      {/* -------------------------------- */}
      <div className="overflow-auto border border-gray-300 rounded-lg mb-12">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="p-2 text-left">Team</th>

              {[...data[0].matches].reverse().map((m, i) => (
                <th key={i} className="p-2">
                  {m.matchName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((team) => (
              <tr
                key={team.teamName}
                className="border-t border-gray-300"
              >
                <td className="p-2 font-semibold">
                  {team.teamName}
                </td>

                {[...team.matches].reverse().map((m, i) => (
                  <td key={i} className="p-2 text-xs">
                    <div className="font-semibold">{m.points}</div>
                    <div className="text-gray-600">
                      C: {m.captain}
                    </div>
                    <div className="text-gray-500">
                      VC: {m.vc}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------------------------------- */}
      {/* 🏁 FANCY LEADERBOARD RACE */}
      {/* -------------------------------- */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🏁 Leaderboard Race
        </h2>

        <div className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm">
          <div className="mb-6 text-lg font-semibold text-gray-700">
            Match {currentMatch}
          </div>

          <div className="space-y-3">
            {(() => {
              const row = standings[currentMatch - 1];

              const sorted = [...row.table].sort(
                (a, b) => a.rank - b.rank
              );

              const maxPoints = Math.max(
                ...sorted.map((t) => t.points)
              );

              return sorted.map((team, index) => {
                const widthPercent =
                  (team.points / maxPoints) * 100;

                const isLeader = index === 0;

                return (
                  <div
                    key={team.team}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-700 ${
                      isLeader
                        ? "bg-yellow-50 border border-yellow-300 shadow-md scale-[1.02]"
                        : "bg-gray-50"
                    }`}
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                          isLeader
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        {team.rank}
                      </div>

                      <div className="font-semibold">
                        {team.team}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3 w-2/3">
                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-3 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{
                            width: `${widthPercent}%`,
                          }}
                        />
                      </div>

                      <div className="w-16 text-right font-semibold text-sm">
                        {team.points.toFixed(0)}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}