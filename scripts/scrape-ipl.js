import { chromium } from "playwright";
import fs from "fs";

const DASHBOARD_API = "https://ipl-dynamic.vercel.app/api/ipl";
const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const SNAPSHOT_PATH = "./app/api/ipl/live-snapshot.json";

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

    const results = [];

    const totalRows = await page.$$eval("#leadersList li", (els) => els.length);

    for (let i = 0; i < totalRows; i++) {
      // 🔁 Always re-fetch rows (SPA-safe)
      const rows = await page.$$("#leadersList li");
      const row = rows[i];

      const rank = parseInt(
        (await row
          .$eval(".m11c-matchCount", (el) => el.innerText)
          .catch(() => "999"))
          .trim(),
        10
      );

      const name = await row
        .$eval(".m11c-plyrSel__name span", (el) => el.innerText)
        .catch(() => "");

      const points = parseFloat(
        (await row
          .$eval(".m11c-tbl__cell--pts span", (el) => el.innerText)
          .catch(() => "0"))
          .replace(/,/g, "")
      );

      // 👉 CLICK TEAM
      await row.scrollIntoViewIfNeeded();
      await row.click();

      await page.waitForTimeout(1200);

      // 👉 MATCH POINTS
      const matchPoints = parseFloat(
        await page
          .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
          .catch(() => "0")
      );

      // 👉 SWITCH TO OVERALL TAB
      const tabs = await page.$$("li.swiper-slide");

      for (const tab of tabs) {
        const text = await tab.innerText();
        if (text.trim().toUpperCase() === "OVERALL") {
          await tab.click();
          break;
        }
      }

      await page.waitForTimeout(1200);

      // 👉 TRANSFERS + BOOSTERS
      let transfersLeft = null;
      let boostersUsed = null;

      try {
        const transferBlock = await page.$(".m11c-transfer__head");

        if (transferBlock) {
          const spans = await transferBlock.$$("span");

          for (const span of spans) {
            const text = await span.innerText();

            if (text.includes("Transfers Left")) {
              const val = await span
                .$eval("em", (el) => el.innerText)
                .catch(() => null);

              if (val) {
                transfersLeft = parseInt(val.split("/")[0]);
              }
            }

            if (text.includes("Boosters used")) {
              boostersUsed = await span
                .$eval("em", (el) => el.innerText)
                .catch(() => null);
            }
          }
        }
      } catch (err) {
        console.log("⚠️ Transfer parse failed for:", name);
      }

      console.log(
        `📌 ${name} | Match: ${matchPoints} | Tx: ${transfersLeft} | Boost: ${boostersUsed}`
      );

      results.push({
        rank,
        name: name.trim(),
        points,
        lastMatchPoints: matchPoints,
        transfersLeft,
        boostersUsed,
      });

      // 👉 CLOSE PANEL (instead of goBack)
      await page.click("body");
      await page.waitForTimeout(800);

      await page.waitForSelector("#leadersList li");
    }

    console.log("✅ Scraped", results.length);

    const payload = {
      updatedAt: new Date().toISOString(),
      leaders: results,
    };

    // 💾 Save snapshot LOCALLY (this fixes your fallback issue)
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(payload, null, 2));
    console.log("💾 Snapshot updated locally");

    // 📡 Send to Vercel API
    const res = await fetch(DASHBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 API status:", res.status);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
}