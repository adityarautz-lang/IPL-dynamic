import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/ipl"
    : "https://ipl-dynamic.vercel.app/api/ipl";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

async function scrapeIPL() {
  console.log("🚀 Starting IPL scraper...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: "state.json",
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("#leadersList li");

    const results = [];
    const rows = await page.$$("#leadersList li");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const rank = parseInt(
        (await row.$eval(".m11c-matchCount", el => el.innerText)).trim(),
        10
      );

      const name = await row.$eval(
        ".m11c-plyrSel__name span",
        el => el.innerText
      );

      const points = parseFloat(
        (await row.$eval(".m11c-tbl__cell--pts span", el => el.innerText))
          .replace(/,/g, "")
      );

      await row.click();
      await page.waitForTimeout(1200);

      const matchPoints = parseFloat(
        await page.$eval(".m11c-pitch__fix-rgt em", el => el.innerText)
      );

      await page.waitForSelector(".m11c-pitch__plyr");

      let captain = null;
      let viceCaptain = null;

      const players = await page.$$(".m11c-pitch__plyr");

      for (const player of players) {
        const cls = await player.getAttribute("class");

        const pname = await player.$eval(
          ".m11c-pitch__plyr-name span",
          el => el.innerText
        );

        const ppoints = parseInt(
          await player.$eval(
            ".m11c-pitch__plyr-num span",
            el => el.innerText
          )
        ) || 0;

        const style = await player.$eval(
          ".m11c-pitch__plyr-thumb",
          el => el.getAttribute("style")
        );

        const match = style.match(/url\(["']?(.+?)["']?\)/);
        const image = match ? match[1] : null;

        if (cls.includes("m11c-cap")) {
          captain = { name: pname, points: ppoints, image };
        }

        if (cls.includes("m11c-vcap")) {
          viceCaptain = { name: pname, points: ppoints, image };
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

export default scrapeIPL;

if (process.argv[1].includes("scrape-ipl.js")) {
  scrapeIPL();
}