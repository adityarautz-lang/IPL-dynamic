"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { DashboardData } from "@/app/types";
import type { MatchRoast } from "@/app/lib/ai-roast";

interface UseRoastAgentOptions {
  matchId?: number;
  onNewRoasts?: (roasts: MatchRoast[]) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface RoastAgentState {
  roasts: MatchRoast[];
  isConnected: boolean;
  lastUpdate: Date | null;
  isGenerating: boolean;
}

/**
 * Hook to connect to the roast WebSocket server and receive real-time roasts
 */
export function useRoastAgent(options: UseRoastAgentOptions = {}) {
  const { matchId = 29, onNewRoasts, autoRefresh = true, refreshInterval = 30000 } = options;

  const [state, setState] = useState<RoastAgentState>({
    roasts: [],
    isConnected: false,
    lastUpdate: null,
    isGenerating: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch roasts from API
  const fetchRoasts = useCallback(async (mid?: number) => {
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const res = await fetch("/api/roast?matchId=" + (mid || matchId));
      if (res.ok) {
        const data = await res.json();
        if (data.roasts) {
          setState(prev => ({
            ...prev,
            roasts: data.roasts,
            lastUpdate: new Date(),
            isGenerating: false,
          }));
          onNewRoasts?.(data.roasts);
        }
      }
    } catch (error) {
      console.error("Failed to fetch roasts:", error);
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [matchId, onNewRoasts]);

  // Connect to WebSocket
  useEffect(() => {
    if (!autoRefresh) return;

    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      try {
        const ws = new WebSocket("ws://localhost:3001");

        ws.onopen = () => {
          console.log("Roast Agent: Connected to WebSocket");
          setState(prev => ({ ...prev, isConnected: true }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "match_update" || data.matchId) {
              fetchRoasts(data.matchId || matchId + 1);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          console.log("Roast Agent: Disconnected");
          setState(prev => ({ ...prev, isConnected: false }));
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = (error) => {
          console.error("Roast Agent: WebSocket error", error);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Roast Agent: Failed to connect", error);
        // Fallback to polling
        intervalRef.current = setInterval(() => fetchRoasts(), refreshInterval);
      }
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(reconnectTimer);
    };
  }, [autoRefresh, fetchRoasts, matchId, refreshInterval]);

  // Initial fetch
  useEffect(() => {
    fetchRoasts();
  }, [fetchRoasts]);

  // Manually trigger roast generation
  const generateRoasts = useCallback(async (newMatchId?: number) => {
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: newMatchId || matchId }),
      });

      if (res.ok) {
        const result = await res.json();
        setState(prev => ({
          ...prev,
          roasts: result.roasts,
          lastUpdate: new Date(),
          isGenerating: false,
        }));
        onNewRoasts?.(result.roasts);
        return result.roasts;
      }
    } catch (error) {
      console.error("Failed to generate roasts:", error);
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
    return [];
  }, [matchId, onNewRoasts]);

  // Get roasts filtered by sentiment
  const getPositiveRoasts = useCallback(() => {
    return state.roasts.filter(r => r.sentiment === "positive");
  }, [state.roasts]);

  const getNegativeRoasts = useCallback(() => {
    return state.roasts.filter(r => r.sentiment === "negative");
  }, [state.roasts]);

  return {
    roasts: state.roasts,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    isGenerating: state.isGenerating,
    generateRoasts,
    fetchRoasts,
    getPositiveRoasts,
    getNegativeRoasts,
  };
}

export default useRoastAgent;