import scrapeIPL from "./scrape-ipl.js";

const INTERVAL = 2 * 60 * 1000; // 2 minutes

function isWithinSchedule() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();

  const current = hours * 60 + minutes;

  const start = 19 * 60 + 20; // 7:20 PM
  const end = 24 * 60;        // 12:00 AM (midnight)

  return current >= start && current < end;
}

async function runOnce() {
  const now = new Date().toLocaleTimeString();

  if (!isWithinSchedule()) {
    console.log(`⏸ [${now}] Outside schedule — skipping`);
    return;
  }

  console.log(`▶ [${now}] Running scraper...`);

  try {
    await scrapeIPL();
    console.log(`✅ [${now}] Scrape complete`);
  } catch (err) {
    console.error(`❌ [${now}] Scraper error:`, err);
  }
}

async function runScheduler() {
  console.log("⏰ Scheduler started...");

  // 🔥 Run immediately once (no delay)
  await runOnce();

  // 🔁 Then run every 2 minutes
  setInterval(runOnce, INTERVAL);
}

runScheduler();