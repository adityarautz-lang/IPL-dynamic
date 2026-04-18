"use client";

import {
  formatMatchTime,
  getMatchStatus,
  getTimeLeft,
} from "../lib/utils/time";

type Match = {
  id: number;
  team1: string;
  team2: string;
  date: string;
};

export default function MatchCard({ match }: { match: Match }) {
  const status = getMatchStatus(match.date);

  return (
    <div className="p-4 rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-800 shadow-lg border border-zinc-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">
          {match.team1} vs {match.team2}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            status === "LIVE"
              ? "bg-red-500 text-white animate-pulse"
              : status === "STARTING SOON"
                ? "bg-yellow-500 text-black"
                : status === "ENDED"
                  ? "bg-gray-500"
                  : "bg-blue-500"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-zinc-400">{formatMatchTime(match.date)}</p>

      {status !== "ENDED" && status !== "LIVE" && (
        <p className="text-xs text-zinc-500 mt-1">
          Starts in: {getTimeLeft(match.date)}
        </p>
      )}

      {status === "LIVE" && (
        <p className="text-xs text-red-400 mt-1">
          🔥 Something is definitely collapsing somewhere
        </p>
      )}
    </div>
  );
}
