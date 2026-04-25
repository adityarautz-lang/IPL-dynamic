"use client";

import { useState, useEffect, useCallback } from "react";
import type { RoastResult } from "@/app/lib/ai-agent";

// Compact color palettes
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
  { bg: "bg-rose-500/15", border: "border-rose-500/50", accent: "text-rose-400" },
  { bg: "bg-indigo-500/15", border: "border-indigo-500/50", accent: "text-indigo-400" },
  { bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/50", accent: "text-fuchsia-400" },
];

function getTeamColor(teamName: string) {
  const hash = teamName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLOR_PALETTES[hash % COLOR_PALETTES.length];
}

export function RoastDisplay() {
  const [roasts, setRoasts] = useState<RoastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roast?" + Date.now());
      const data = await res.json();
      if (data.error) setError(data.error);
      else setRoasts(data.roasts || []);
    } catch { setError("Connection failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRoasts();
    const interval = setInterval(fetchRoasts, 4 * 60 * 60 * 1000); // 4 hours
    return () => clearInterval(interval);
  }, [fetchRoasts]);

  if (error && roasts.length === 0) {
    return (
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center text-xs text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-white">🔥 AI Roasts</span>
      </div>

      {/* Loading */}
      {loading && roasts.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {roasts.map((roast) => {
          const colors = getTeamColor(roast.teamName);
          const lines = roast.roast.split("\n").filter(l => l.trim());
          
          return (
            <div 
              key={roast.id}
              className={`p-2.5 rounded-lg ${colors.bg} border-l-2 ${colors.border}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">
                    {roast.teamName}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-cyan-400">#{roast.analysis.matchRank}</span>
                  <span className={
                    roast.analysis.rankMovement === "up" ? "text-emerald-400" : 
                    roast.analysis.rankMovement === "down" ? "text-red-400" : "text-slate-500"
                  }>
                    {roast.analysis.rankMovement === "up" ? "↑" : 
                     roast.analysis.rankMovement === "down" ? "↓" : "→"}
                  </span>
                </div>
              </div>

              {/* Roast */}
              <div className={`text-[11px] leading-snug ${colors.accent} min-h-[2.5rem]`}>
                <div className="truncate">{lines[0] || ""}</div>
                <div className="truncate opacity-80">{lines[1] || ""}</div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                <span>{roast.matchPoints}pts</span>
                <span className="capitalize">{roast.analysis.matchPerformance.replace("_", " ")}</span>
              </div>
            </div>
          );
        })}
      </div>

      {loading && roasts.length > 0 && (
        <div className="text-center text-[10px] text-slate-500 mt-2 animate-pulse">
          Refreshing...
        </div>
      )}
    </div>
  );
}

export default RoastDisplay;