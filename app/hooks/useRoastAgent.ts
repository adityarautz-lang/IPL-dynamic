"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { DashboardData } from "@/app/types";
import type { Roast } from "@/app/lib/ai-roast";

interface UseRoastAgentOptions {
  onNewRoasts?: (roasts: Roast[]) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface RoastAgentState {
  roasts: Roast[];
  isConnected: boolean;
  lastUpdate: Date | null;
  isGenerating: boolean;
}

/**
 * Hook to connect to the roast WebSocket server and receive real-time roasts
 */
export function useRoastAgent(options: UseRoastAgentOptions = {}) {
  const { onNewRoasts, autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [state, setState] = useState<RoastAgentState>({
    roasts: [],
    isConnected: false,
    lastUpdate: null,
    isGenerating: false,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch new roasts from API
  const fetchRoasts = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const res = await fetch("/api/roast");
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
  }, [onNewRoasts]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket("ws://localhost:3001");

      ws.onopen = () => {
        console.log("🔥 Roast Agent: Connected to WebSocket");
        setState(prev => ({ ...prev, isConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // If we receive dashboard data update, trigger roast generation
          if (data.leaders || data.type === "dashboard_update") {
            fetchRoasts();
          }
        } catch (e) {
          console.error("Roast Agent: Failed to parse message", e);
        }
      };

      ws.onclose = () => {
        console.log("❌ Roast Agent: Disconnected");
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("Roast Agent: WebSocket error", error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Roast Agent: Failed to connect", error);
      // Fall back to polling
      if (autoRefresh) {
        intervalRef.current = setInterval(fetchRoasts, refreshInterval);
      }
    }
  }, [autoRefresh, fetchRoasts, refreshInterval]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  // Initial connection
  useEffect(() => {
    connect();
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchRoasts, refreshInterval);
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoRefresh, fetchRoasts, refreshInterval]);

  // Manually trigger roast generation
  const generateRoasts = useCallback(async (data?: DashboardData) => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardData: data }),
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
  }, [onNewRoasts]);

  // Get roasts filtered by sentiment
  const getPositiveRoasts = useCallback(() => {
    return state.roasts.filter(r => r.sentiment === "positive");
  }, [state.roasts]);

  const getNegativeRoasts = useCallback(() => {
    return state.roasts.filter(r => r.sentiment === "negative");
  }, [state.roasts]);

  const getNeutralRoasts = useCallback(() => {
    return state.roasts.filter(r => r.sentiment === "neutral");
  }, [state.roasts]);

  return {
    // State
    roasts: state.roasts,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    isGenerating: state.isGenerating,
    
    // Actions
    generateRoasts,
    fetchRoasts,
    connect,
    disconnect,
    
    // Filters
    getPositiveRoasts,
    getNegativeRoasts,
    getNeutralRoasts,
  };
}

export default useRoastAgent;