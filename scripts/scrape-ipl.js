// scrape-ipl.js

const API_URL = process.env.API_URL || "http://localhost:3000/api/ipl";
const CRON_SECRET = process.env.CRON_SECRET || "";

async function fetchIPLData() {
  // 🔴 Replace this with your real scraping logic
  // Example structure expected by your API:

  return {
    updatedAt: new Date().toISOString(),
    leaders: [
      {
        name: "Team A",
        points: 120,
        matchId: 10,
      },
      {
        name: "Team B",
        points: 110,
        matchId: 10,
      },
    ],
  };
}

async function sendToAPI(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log("✅ POST success:", data);
  } catch (err) {
    console.error("❌ POST failed:", err);
  }
}

async function run() {
  console.log("🚀 Running IPL scraper...");

  const payload = await fetchIPLData();

  if (!payload || !payload.leaders?.length) {
    console.log("⚠️ No valid data scraped. Skipping POST.");
    return;
  }

  await sendToAPI(payload);
}

run();
