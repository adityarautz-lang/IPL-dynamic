"use client";

import { useState, useEffect, useCallback } from "react";
import type { RoastResult } from "@/app/lib/ai-agent";

const COLOR_PALETTES = [
  { bg: "bg-pink-500/15", border: "border-pink-500/50", accent: "text-pink-400" },
  { bg: "bg-purple-500/15", border: "border-purple-500/50", accent: "text-purple-400" },
  { bg: "bg-blue-500/15", border: "border-blue-500/50", accent: "text-blue-400" },
  { bg: "bg-cyan-500/15", border: "border-cyan-500/50", accent: "text-cyan-400" },
  { bg: "bg-teal-500/15", border: "border-teal-500/50", accent: "text-teal-400" },
  { bg: "bg-green-500/15", border: "border-green-500/50", accent: "text-green-400" },
  { bg: "bg-yellow-500/15", border: "border-yellow-500/50", accent: "text-yellow-400" },
  { bg: "bg-orange-500/15", border: "border-orange-500/50", accent: "text-orange-400" },
  { bg: "bg-red-500/15", border: "border-red-500/50", accent: "text-red-400" },
];

function getTeamColor(teamName: string) {
  const hash = teamName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLOR_PALETTES[hash % COLOR_PALETTES.length];
}

export default function RoastDisplay() {
  const [roasts, setRoasts] = useState<RoastResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoasts = useCallback(async () => {
    try {
      const res = await fetch("/api/roast?" + Date.now());
      const data = await res.json();
      setRoasts(data.roasts || []);
    } catch (err) {
      console.error("Failed to fetch roasts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoasts();
  }, [fetchRoasts]);

  return (
    <div>
      {/* Header */}
      <div className="mb-3 px-1">
        <span className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">🔥 AI Roasts</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {roasts.map((roast) => {
          const colors = getTeamColor(roast.teamName);

          return (
            <div
              key={roast.id}
              className={`p-4 rounded-lg ${colors.bg} border-l-2 ${colors.border} h-auto flex flex-col`}
            >
              {/* Header */}
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-white break-words">
                  {roast.teamName}
                </span>
                <span className="text-xs text-cyan-400">
                  #{roast.analysis.matchRank}
                </span>
              </div>

              {/* ✅ FULL TEXT - NO LIMITS */}
              <p
                className={`text-sm leading-relaxed ${colors.accent} break-words whitespace-normal`}
              >
                {roast.roast}
              </p>

              {/* Footer */}
              <div className="mt-2 text-xs text-slate-400">
                {roast.matchPoints} pts
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-xs text-slate-500 mt-2">
          Loading...
        </div>
      )}
    </div>
  );
}