import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "prod"
    ? "https://ipl-dynamic.vercel.app/api/ipl"
    : "http://localhost:3000/api/ipl";

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

    await page.waitForSelector("#leadersList li", { timeout: 30000 });

    const results = [];

    const totalRows = await page.$$eval(
      "#leadersList li",
      (els) => els.length
    );

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

      // 👉 MATCH POINTS
      const matchPoints = parseFloat(
        await page
          .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
          .catch(() => "0")
      );

      await page.waitForSelector(".m11c-pitch__plyr");

      // 👉 CAPTAIN / VC
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
      } catch {
        console.log("⚠️ Captain parse failed for:", name);
      }

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
      } catch {
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
        captain,
        viceCaptain,
      });

      // 👉 CLOSE PANEL
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

    const payload = {
      updatedAt: new Date().toISOString(),
      leaders: results,
    };

    // 👉 PUSH DATA
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

// 👉 Allow direct run
if (process.argv[1].includes("scrape-ipl.js")) {
  scrapeIPL();
}