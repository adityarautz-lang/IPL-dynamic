"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hashData = (data: any) => JSON.stringify(data);

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);

  const lastHashRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ✅ Initial DB load
  useEffect(() => {
    fetch("/api/ipl")
      .then((res) => res.json())
      .then((json) => {
        if (json) {
          setData(json);
          lastHashRef.current = hashData(json);
        }
      })
      .catch(console.error);
  }, []);

  // ✅ Debounced POST
  const syncToDB = (payload: DashboardData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        await fetch("/api/ipl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("POST failed:", err);
      }
    }, 5000);
  };

  // ✅ Polling fallback
  const startPolling = () => {
    if (pollingRef.current) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/ipl?t=${Date.now()}`, {
          cache: "no-store",
        });

        const json = await res.json();
        if (!json) return;

        const newHash = hashData(json);

        if (newHash !== lastHashRef.current) {
          setData(json);
          lastHashRef.current = newHash;
          syncToDB(json);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    load();
    pollingRef.current = window.setInterval(load, 30000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // ✅ WebSocket (primary)
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WS connected");
      stopPolling(); // 🔥 stop polling when WS works
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const newHash = hashData(parsed);

        if (newHash !== lastHashRef.current) {
          setData(parsed);
          lastHashRef.current = newHash;
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    ws.onerror = () => {
      console.log("⚠️ WS error → fallback to polling");
      startPolling();
    };

    ws.onclose = () => {
      console.log("🔴 WS disconnected → fallback to polling");
      startPolling();
    };

    return () => {
      ws.close();
      stopPolling();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return data;
}
