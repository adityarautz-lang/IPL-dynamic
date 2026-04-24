// server/wsServer.ts
import { WebSocketServer } from "ws";
import { roastGenerator } from "@/app/lib/ai-roast";
import type { DashboardData } from "@/app/types";

const wss = new WebSocketServer({ port: 3001 });

interface WSMessage {
  type: "dashboard_update" | "get_roasts" | "roast_update";
  data?: DashboardData;
  roasts?: unknown[];
  timestamp?: string;
}

let latestData: DashboardData | null = null;
let cachedRoasts: unknown[] = [];

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  // Send latest data and roasts immediately
  if (latestData) {
    const roasts = roastGenerator.generateAllRoasts(latestData);
    cachedRoasts = roasts;
    
    ws.send(JSON.stringify({
      type: "dashboard_update",
      data: latestData,
      roasts,
      timestamp: new Date().toISOString(),
    }));
  }

  ws.on("message", (message) => {
    try {
      const msg: WSMessage = JSON.parse(message.toString());
      
      if (msg.type === "get_roasts") {
        ws.send(JSON.stringify({
          type: "roast_update",
          roasts: cachedRoasts,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error("Failed to parse message:", e);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

// 🔥 Broadcast function - call this when dashboard data updates
export function broadcast(data: DashboardData) {
  latestData = data;
  
  // Generate fresh roasts
  cachedRoasts = roastGenerator.generateAllRoasts(data);

  const payload: WSMessage = {
    type: "dashboard_update",
    data,
    roasts: cachedRoasts,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  });
}

// Get current roasts
export function getRoasts() {
  return cachedRoasts;
}

// Check if server is ready
export function isReady() {
  return latestData !== null;
}