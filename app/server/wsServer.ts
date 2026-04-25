// server/wsServer.ts
import { WebSocketServer } from "ws";
import { generateMatchRoasts, cacheRoasts, type MatchRoast } from "@/app/lib/ai-roast";

const wss = new WebSocketServer({ port: 3001 });

interface MatchUpdate {
  type: "match_update";
  matchId: number;
}

interface GetRoastsRequest {
  type: "get_roasts";
  matchId?: number;
}

type WSMessage = MatchUpdate | GetRoastsRequest;

let latestMatchId = 29;
let cachedRoasts: MatchRoast[] = [];

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  // Send current roasts on connect
  if (cachedRoasts.length > 0) {
    ws.send(JSON.stringify({
      type: "match_update",
      matchId: latestMatchId,
      roasts: cachedRoasts,
    }));
  }

  ws.on("message", (message) => {
    try {
      const msg: WSMessage = JSON.parse(message.toString());

      if (msg.type === "match_update") {
        latestMatchId = msg.matchId;
        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "match_update",
              matchId: latestMatchId,
            }));
          }
        });
      }
    } catch (e) {
      console.error("Failed to parse message:", e);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

export function broadcastMatchUpdate(matchId: number): void {
  latestMatchId = matchId;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: "match_update",
        matchId,
      }));
    }
  });
}

export function getLatestRoasts(): MatchRoast[] {
  return cachedRoasts;
}