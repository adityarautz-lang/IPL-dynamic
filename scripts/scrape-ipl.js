import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "local"
    ? "http://localhost:3000/api/ipl"
    : "https://ipl-dynamic.vercel.app/api/ipl";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const TOTAL_MATCHES = 70;

const now = () => new Date().toISOString();

// Snapshot only at midnight
function shouldSnapshot() {
  const hour = new Date().getHours();
  return hour === 0;
}

async function scrapeIPL() {
  console.log(`\n==============================`);
  console.log(`🚀 START scrape at: ${now()}`);

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    storageState: "state.json",
  });

  const page = await context.newPage();

  try {
    // ✅ FIX: safer navigation
    await page.goto(TARGET_URL, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // ==============================
    // 📊 MATCH PROGRESS
    // ==============================
    let currentMatch = null;
    let completedMatches = null;
    let completedPct = null;

    try {
      const matchText = await page
        .$eval(
          ".m11c-scoreBoard__box .m11c-matchTxt",
          (el) => el.textContent.trim()
        )
        .catch(() => null);

      console.log(`📍 Raw match text:`, matchText);

      if (matchText) {
        const matchNumber = matchText.match(/\d+/);

        if (matchNumber) {
          currentMatch = Number(matchNumber[0]);
          completedMatches = currentMatch - 1;
          completedPct =
            (completedMatches / TOTAL_MATCHES) * 100;
        }
      }
    } catch {}

    console.log(`📊 Match Progress:`, {
      currentMatch,
      completedMatches,
      completedPct,
    });

    // ==============================
    // 👇 LEADERBOARD
    // ==============================

    await page.waitForSelector("#leadersList li", { timeout: 10000 });

    const rows = await page.$$("#leadersList li");

    console.log(`📊 Rows found: ${rows.length}`);

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];

        const rank = parseInt(
          (await row
            .$eval(".m11c-matchCount", (el) => el.innerText)
            .catch(() => "999")).trim(),
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
        await row.click({ timeout: 5000 });

        // ✅ CRITICAL FIX: wait for match points to load
        await page.waitForFunction(() => {
          const el = document.querySelector(".m11c-pitch__fix-rgt em");
          if (!el) return false;

          const text = el.textContent || "";
          return text.trim() !== "";
        }, { timeout: 10000 }).catch(() => {});

        // small buffer (stabilization)
        await page.waitForTimeout(300);

        const matchPoints =
          parseFloat(
            await page
              .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
              .catch(() => "0")
          ) || 0;

        let captain = null;
        let viceCaptain = null;

        try {
          const players = await page.$$(".m11c-pitch__plyr");

          for (const player of players) {
            const className = (await player.getAttribute("class")) || "";

            const playerName = await player
              .$eval(".m11c-pitch__plyr-name span", (el) => el.innerText)
              .catch(() => "");

            const playerPoints =
              parseInt(
                await player
                  .$eval(".m11c-pitch__plyr-num span", (el) => el.innerText)
                  .catch(() => "0")
              ) || 0;

            if (className.includes("m11c-cap")) {
              captain = { name: playerName.trim(), points: playerPoints };
            }

            if (className.includes("m11c-vcap")) {
              viceCaptain = { name: playerName.trim(), points: playerPoints };
            }
          }
        } catch {}

        console.log(`📌 ${name} | Match: ${matchPoints}`);

        results.push({
          rank,
          name: name.trim(),
          points,
          lastMatchPoints: matchPoints,
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

      } catch {
        console.log(`⚠️ Row ${i} failed`);
        continue;
      }
    }

    console.log(`✅ Scraped ${results.length} teams`);

    const payload = {
      updatedAt: now(),
      leaders: results,
      currentMatch,
      completedMatches,
      completedPct,
    };

    console.log(`📦 Payload ready`);

    // ---------------------------
    // 🔥 LIVE UPDATE
    // ---------------------------
    await fetch(DASHBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 LIVE pushed");

    // ---------------------------
    // 📸 SNAPSHOT (midnight)
    // ---------------------------
    if (shouldSnapshot()) {
      console.log("📸 Creating snapshot...");

      await fetch(DASHBOARD_API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📸 Snapshot saved");
    }

  } catch (err) {
    console.error(`❌ Fatal error:`, err);
  } finally {
    await browser.close();
    console.log(`🏁 END scrape at: ${now()}`);
    console.log(`==============================\n`);
  }
}

export default scrapeIPL;

if (process.argv[1]?.includes("scrape-ipl")) {
  scrapeIPL();
}