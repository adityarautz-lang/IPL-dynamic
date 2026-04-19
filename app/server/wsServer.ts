// server/wsServer.ts
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let latestData: any = null;

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  // Send latest data immediately
  if (latestData) {
    ws.send(JSON.stringify(latestData));
  }

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

// 🔥 Broadcast function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function broadcast(data: any) {
  latestData = data;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}
