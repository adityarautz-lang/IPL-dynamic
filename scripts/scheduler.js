import cron from "node-cron";
import scrapeIPL from "./scrape-ipl.js";

console.log("⏰ Scheduler started...");

cron.schedule("*/2 * * * *", async () => {
    console.log("🔁 Running scraper...");
  await scrapeIPL();
});