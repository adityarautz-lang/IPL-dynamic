import scrapeIPL from "./scrape-ipl.js";

const INTERVAL = 2 * 60 * 1000; // 2 minutes

function isWithinSchedule() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();

  const current = hours * 60 + minutes;

  const start = 19 * 60 + 20; // 7:20 PM
  const end = 24 * 60;        // 12:00 AM

  return current >= start && current < end;
}

// ✅ UPDATED: safer post-match window (12 AM → 2 AM)
function isPostMatchWindow() {
  const now = new Date();
  const hours = now.getHours();

  return hours >= 0 && hours <= 1; // 12:00–1:59 AM
}

async function runOnce() {
  const now = new Date();
  const nowStr = now.toLocaleTimeString();

  const inSchedule = isWithinSchedule();
  const postMatch = isPostMatchWindow();

  if (!inSchedule && !postMatch) {
    console.log(`⏸ [${nowStr}] Outside schedule — skipping`);
    return;
  }

  if (postMatch) {
    console.log(`🟡 [${nowStr}] Post-match window → ensuring final snapshot`);
  } else {
    console.log(`▶ [${nowStr}] Live window → running scraper`);
  }

  try {
    await scrapeIPL();
    console.log(`✅ [${nowStr}] Scrape complete`);
  } catch (err) {
    console.error(`❌ [${nowStr}] Scraper error:`, err);
  }
}

async function runScheduler() {
  console.log("⏰ Scheduler started...");

  // 🔥 Run immediately once
  await runOnce();

  // 🔁 Then run every 2 minutes
  setInterval(runOnce, INTERVAL);
}

runScheduler();