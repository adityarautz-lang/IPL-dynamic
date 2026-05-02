import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "prod"
    ? "https://ipl-dynamic.vercel.app/api/ipl/history-test"
    : "http://localhost:3000/api/ipl/history-test";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const now = () => new Date().toISOString();

async function scrapeHistory() {
  console.log("📊 Starting per-match history scrape...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: "state.json",
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("#leadersList li", { timeout: 30000 });

    const teams = await page.$$("#leadersList li");

    const allTeams = [];

    for (let i = 0; i < teams.length; i++) {
      const row = teams[i];

      const teamName = await row
        .$eval(".m11c-plyrSel__name span", el => el.innerText.trim())
        .catch(() => `Team-${i}`);

      console.log("👉", teamName);

      // open modal
      await row.click();
      await page.waitForSelector(".m11c-overlay__header");
      await page.waitForTimeout(800);

      // click OVERALL tab
      const tabs = await page.$$("li.swiper-slide");

      for (const tab of tabs) {
        const text = await tab.innerText();
        if (text.trim().toUpperCase() === "OVERALL") {
          await tab.click();
          break;
        }
      }

      await page.waitForTimeout(800);

      const scrollContainer = await page.$(".m11c-pitch__area");

      let results = [];
      let seen = new Set();
      let lastScrollTop = -1;

      while (true) {
        const matches = await page.$$(".m11c-contest__box");

        for (const match of matches) {
          const matchName = await match
            .$eval(".m11c-contest__box-head span", el => el.innerText.trim())
            .catch(() => "");

          if (!matchName || seen.has(matchName)) continue;

          const points = parseFloat(
            await match
              .$eval(".m11c-contest__pitch-num span", el => el.innerText)
              .catch(() => "0")
          ) || 0;

          seen.add(matchName);

          results.push({
            matchIndex: results.length + 1,
            matchName,
            points,
          });
        }

        const scrollTop = await scrollContainer.evaluate(el => el.scrollTop);

        await scrollContainer.evaluate(el => el.scrollTop += 300);
        await page.waitForTimeout(600);

        const newScrollTop = await scrollContainer.evaluate(el => el.scrollTop);

        if (newScrollTop === lastScrollTop) break;
        lastScrollTop = newScrollTop;
      }
      allTeams.push({
        teamName,
        history: results.reverse(),
      });

      console.log(`✅ ${teamName} → ${results.length} matches`);

      // close modal
      await page.keyboard.press("Escape");
      await page.waitForTimeout(800);
    }

    console.log("📦 Done:", allTeams.length);

    await fetch(DASHBOARD_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updatedAt: now(),
        teams: allTeams,
      }),
    });

    console.log("📡 History saved");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
}

scrapeHistory();