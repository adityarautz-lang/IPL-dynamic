import scrapeIPL from "./scrape-ipl.js";

const INTERVAL = 2 * 60 * 1000; // 2 mins

function isWithinSchedule() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();

  const current = hours * 60 + minutes;

  const start = 19 * 60 + 20; // 7:20 PM
  const end = 24 * 60;        // 12:00 AM (midnight)

  // since end is midnight same day, simple check works
  return current >= start && current < end;
}

async function runScheduler() {
  console.log("⏰ Scheduler started...");

  setInterval(async () => {
    const now = new Date().toLocaleTimeString();

    if (!isWithinSchedule()) {
      console.log(`⏸ [${now}] Outside schedule — skipping`);
      return;
    }

    console.log(`▶ [${now}] Running scraper...`);

    try {
      await scrapeIPL();
    } catch (err) {
      console.error("❌ Scraper error:", err);
    }

  }, INTERVAL);
}

runScheduler();