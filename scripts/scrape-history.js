import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "prod"
    ? "https://ipl-dynamic.vercel.app/api/ipl"
    : "http://localhost:3000/api/ipl";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

async function scrapeHistory() {
  console.log("📊 Starting history scrape...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: "state.json",
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("#leadersList li", { timeout: 30000 });

    const leagueData = await page.evaluate(async () => {
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      const waitFor = async (selector, timeout = 7000) => {
        const start = Date.now();
        while (!document.querySelector(selector)) {
          if (Date.now() - start > timeout) {
            throw new Error(`Timeout waiting for ${selector}`);
          }
          await delay(200);
        }
      };

      const teams = document.querySelectorAll("#leadersList li");
      const allTeams = [];

      for (let t = 0; t < teams.length; t++) {
        const team = document.querySelectorAll("#leadersList li")[t];

        const teamName =
          team
            .querySelector(".m11c-plyrSel__name span")
            ?.innerText?.trim() || `Team-${t}`;

        console.log("👉 Processing:", teamName);

        // 👉 Open modal
        team.click();
        await waitFor(".m11c-overlay__header");
        await delay(800);

        // 👉 Click OVERALL tab
        const overallTab = [...document.querySelectorAll(".swiper-slide span")]
          .find(
            (el) =>
              el.innerText.trim().toUpperCase() === "OVERALL"
          );

        overallTab?.click();
        await waitFor(".m11c-contest__box");
        await delay(800);

        const scrollContainer = document.querySelector(
          ".m11c-pitch__area"
        );

        let seen = new Set();
        let results = [];
        let lastScrollTop = -1;

        while (true) {
          const matches = document.querySelectorAll(
            ".m11c-contest__box"
          );

          matches.forEach((match) => {
            const matchName =
              match
                .querySelector(".m11c-contest__box-head span")
                ?.innerText?.trim() || "";

            if (!matchName || seen.has(matchName)) return;

            const points =
              parseFloat(
                match.querySelector(
                  ".m11c-contest__pitch-num span"
                )?.innerText
              ) || 0;

            const captain =
              match
                .querySelector(
                  ".m11c-cap .m11c-pitch__plyr-name span"
                )
                ?.innerText?.trim() || "-";

            const vc =
              match
                .querySelector(
                  ".m11c-vcap .m11c-pitch__plyr-name span"
                )
                ?.innerText?.trim() || "-";

            seen.add(matchName);

            results.push({
              matchIndex: results.length + 1,
              matchName,
              points,
              captain,
              vc,
            });
          });

          scrollContainer.scrollTop += 250;
          await delay(700);

          if (scrollContainer.scrollTop === lastScrollTop) break;
          lastScrollTop = scrollContainer.scrollTop;
        }

        allTeams.push({
          teamName,
          matches: results,
        });

        console.log(`✅ ${teamName} → ${results.length} matches`);

        // 👉 Close modal
        document.querySelector(".m11c-overlay__close")?.click();
        await delay(1000);
      }

      return allTeams;
    });

    console.log("✅ History scrape complete:", leagueData.length);

    // 👉 Push ONLY leagueData
    console.log("📡 Sending to API:", DASHBOARD_API);

    const res = await fetch(DASHBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leagueData,
        updatedAt: new Date().toISOString(),
      }),
    });

    console.log("📡 API status:", res.status);

  } catch (err) {
    console.error("❌ History scrape failed:", err.message);
  } finally {
    await browser.close();
  }
}

scrapeHistory();