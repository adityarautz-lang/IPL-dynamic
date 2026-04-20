import { chromium } from "playwright";

const DASHBOARD_API = "https://ipl-dynamic.vercel.app/api/ipl";
const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

export default async function scrapeIPL() {
  console.log("🚀 Starting IPL scraper...");

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    storageState: "state.json",
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("#leadersList li", { timeout: 15000 });

    const rows = await page.$$("#leadersList li");
    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const name = await row
        .$eval(".m11c-plyrSel__name span", (el) => el.innerText)
        .catch(() => "");

      const points = parseFloat(
        (
          await row
            .$eval(".m11c-tbl__cell--pts span", (el) => el.innerText)
            .catch(() => "0")
        ).replace(/,/g, "")
      );

      await row.click();
      await page.waitForTimeout(1200);

      const matchPoints = parseFloat(
        await page
          .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
          .catch(() => "0")
      );

      results.push({
        name: name.trim(),
        points,
        lastMatchPoints: matchPoints,
      });
    }

    console.log("✅ Scraped", results.length);

    const payload = {
      updatedAt: new Date().toISOString(),
      leaders: results,
    };

    const res = await fetch(DASHBOARD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📡 API status:", res.status);
    console.log("🎉 Dashboard updated");
  } catch (err) {
    console.error("❌ Scraping error:", err.message);
  } finally {
    await browser.close();
  }
}