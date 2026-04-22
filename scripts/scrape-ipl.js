import { chromium } from "playwright";
import fs from "fs";

const DASHBOARD_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/ipl"
    : "https://ipl-dynamic.vercel.app/api/ipl";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const SNAPSHOT_PATH = "./app/api/ipl/live-snapshot.json";

// 🧠 define live window (adjust as needed)
function isMatchLive() {
  const now = new Date();
  const hour = now.getHours();

  // Example: IPL matches between 7 PM – 12 AM
  return hour >= 19 && hour <= 24;
}

async function scrapeIPL() {
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
      const rows = await page.$$("#leadersList li");
      const row = rows[i];

      const rank = parseInt(
        (await row.$eval(".m11c-matchCount", (el) => el.innerText)).trim(),
        10
      );

      const name = await row.$eval(
        ".m11c-plyrSel__name span",
        (el) => el.innerText
      );

      const points = parseFloat(
        (await row
          .$eval(".m11c-tbl__cell--pts span", (el) => el.innerText))
          .replace(/,/g, "")
      );

      await row.click();
      await page.waitForTimeout(1200);

      const matchPoints = parseFloat(
        await page
          .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
      );

      await page.waitForSelector(".m11c-pitch__plyr");

      let captain = null;
      let viceCaptain = null;

      const players = await page.$$(".m11c-pitch__plyr");

      for (const player of players) {
        const className = (await player.getAttribute("class")) || "";

        const playerName = await player.$eval(
          ".m11c-pitch__plyr-name span",
          (el) => el.innerText
        );

        const pointsText = await player.$eval(
          ".m11c-pitch__plyr-num span",
          (el) => el.innerText
        );

        const playerPoints = parseInt(pointsText) || 0;

        const style = await player.$eval(
          ".m11c-pitch__plyr-thumb",
          (el) => el.getAttribute("style")
        );

        const match = style.match(/url\(["']?(.+?)["']?\)/);
        const image = match ? match[1] : null;

        if (className.includes("m11c-cap")) {
          captain = { name: playerName, points: playerPoints, image };
        }

        if (className.includes("m11c-vcap")) {
          viceCaptain = { name: playerName, points: playerPoints, image };
        }
      }

      results.push({
        rank,
        name,
        points,
        lastMatchPoints: matchPoints,
        captain,
        viceCaptain,
      });

      await page.keyboard.press("Escape");
      await page.waitForSelector("#leadersList li");
    }

    results.sort((a, b) => a.rank - b.rank);

    const payload = {
      updatedAt: new Date().toISOString(),
      leaders: results,
    };

    // 💾 ONLY write snapshot when NOT live
    if (!isMatchLive()) {
      fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(payload, null, 2));
      console.log("💾 Snapshot updated (stable state)");
    } else {
      console.log("⏳ Live match → skipping snapshot overwrite");
    }

    // 📡 Always push live data
    try {
      const res = await fetch(DASHBOARD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 API status:", res.status);
    } catch {
      console.warn("⚠️ API push failed");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
}

scrapeIPL();