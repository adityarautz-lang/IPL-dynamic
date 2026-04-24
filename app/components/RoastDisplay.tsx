"use client";

import { useState, useEffect, useMemo } from "react";
import type { Roast } from "@/app/lib/ai-roast";
import { useRoastAgent } from "@/app/hooks/useRoastAgent";
import type { DashboardData } from "@/app/types";

interface RoastDisplayProps {
  dashboardData?: DashboardData;
  maxDisplay?: number;
  autoRefresh?: boolean;
  showSentiment?: {
    positive?: boolean;
    negative?: boolean;
    neutral?: boolean;
  };
}

export function RoastDisplay({
  dashboardData,
  maxDisplay = 4,
  autoRefresh = true,
  showSentiment = { positive: true, negative: true, neutral: true },
}: RoastDisplayProps) {
  const {
    roasts,
    isConnected,
    lastUpdate,
    isGenerating,
    generateRoasts,
  } = useRoastAgent({
    autoRefresh,
  });

  // Generate roasts when dashboard data changes
  useEffect(() => {
    if (dashboardData) {
      generateRoasts(dashboardData);
    }
  }, [dashboardData, generateRoasts]);

  // Show all team roasts
  const displayRoasts = useMemo(() => {
    return [...roasts];
  }, [roasts]);

  // Sentiment styling
  const getSentimentStyle = (sentiment: Roast["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: "🔥",
          text: "text-emerald-400",
        };
      case "negative":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: "💀",
          text: "text-red-400",
        };
      default:
        return {
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          icon: "😐",
          text: "text-slate-400",
        };
    }
  };

  if (displayRoasts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">🏆 Team Verdicts</h3>
          <ConnectionStatus connected={isConnected} />
        </div>
        <p className="text-slate-400 text-sm">
          {isGenerating ? "🤔 Analyzing teams..." : "Waiting for data..."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">🏆 Team Verdicts</h3>
        <div className="flex items-center gap-3">
          {isGenerating && (
            <span className="text-xs text-slate-400 animate-pulse">analyzing...</span>
          )}
          <ConnectionStatus connected={isConnected} />
        </div>
      </div>

      {/* All team roasts */}
      <div className="space-y-2">
        {displayRoasts.map((roast) => (
          <div
            key={roast.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg ${getSentimentStyle(roast.sentiment).bg} border ${getSentimentStyle(roast.sentiment).border}`}
          >
            <span className="text-sm flex-shrink-0 w-6 text-center">
              {getSentimentStyle(roast.sentiment).icon}
            </span>
            <span className="text-xs font-bold w-6 flex-shrink-0 text-slate-400">
              #{roast.performance.rank}
            </span>
            <p className="text-sm text-white flex-1">
              {roast.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Connection status indicator
function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-slate-400">
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}

// Compact badge version
export function RoastBadge({ roast }: { roast: Roast }) {
  const style = {
    positive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    negative: "bg-red-500/20 text-red-400 border-red-500/30",
    neutral: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${style[roast.sentiment]}`}>
      {roast.sentiment === "positive" ? "🔥" : roast.sentiment === "negative" ? "💀" : "😐"}
      {roast.teamName}
    </span>
  );
}

export default RoastDisplay;