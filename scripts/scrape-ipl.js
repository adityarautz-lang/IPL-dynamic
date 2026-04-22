import { chromium } from "playwright";
import fs from "fs";

const DASHBOARD_API = "http://localhost:3000/api/ipl"; // 🔥 use local during dev
const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const SNAPSHOT_PATH = "./app/api/ipl/live-snapshot.json";

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

      // 👉 OPEN TEAM
      await row.scrollIntoViewIfNeeded();
      await row.click();

      await page.waitForTimeout(1200);

      const matchPoints = parseFloat(
        await page
          .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
          .catch(() => "0")
      );

      await page.waitForSelector(".m11c-pitch__plyr", { timeout: 5000 });

      let captain = null;
      let viceCaptain = null;

      try {
        const players = await page.$$(".m11c-pitch__plyr");

        for (const player of players) {
          const className = (await player.getAttribute("class")) || "";

          const playerName = await player
            .$eval(".m11c-pitch__plyr-name span", (el) => el.innerText)
            .catch(() => "");

          const pointsText = await player
            .$eval(".m11c-pitch__plyr-num span", (el) => el.innerText)
            .catch(() => "");

          const playerPoints = parseInt(pointsText) || 0;

          const style = await player
            .$eval(".m11c-pitch__plyr-thumb", (el) =>
              el.getAttribute("style")
            )
            .catch(() => "");

          const match = style.match(/url\(["']?(.+?)["']?\)/);
          const image = match ? match[1] : null;

          if (className.includes("m11c-cap")) {
            captain = {
              name: playerName.trim(),
              points: playerPoints,
              image,
            };
          }

          if (className.includes("m11c-vcap")) {
            viceCaptain = {
              name: playerName.trim(),
              points: playerPoints,
              image,
            };
          }
        }
      } catch (err) {
        console.log("⚠️ C/VC parse failed for:", name);
      }

      console.log(
        `📌 ${name} | Match: ${matchPoints} | C: ${captain?.name} | VC: ${viceCaptain?.name}`
      );

      results.push({
        rank,
        name: name.trim(),
        points,
        lastMatchPoints: matchPoints,
        captain,
        viceCaptain,
      });

      // 👉 CLOSE OVERLAY
      try {
        await page.keyboard.press("Escape");
        await page.waitForSelector(".m11c-overlay__wrap", {
          state: "hidden",
          timeout: 3000,
        });
      } catch {
        await page.mouse.click(10, 10);
      }

      await page.waitForSelector("#leadersList li");
    }

    console.log("✅ Scraped", results.length);

    // ✅ SORT (important for UI consistency)
    results.sort((a, b) => a.rank - b.rank);

    // ✅ FINAL PAYLOAD SHAPE (CRITICAL)
    const payload = {
      updatedAt: new Date().toISOString(),
      leaders: results,
    };

    // 💾 Save snapshot (for fallback + debugging)
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(payload, null, 2));
    console.log("💾 Snapshot updated locally");

    // 📡 Send to API (live)
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

scrapeIPL();