import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "local"
    ? "http://localhost:3000/api/ipl"
    : "https://ipl-dynamic.vercel.app/api/ipl";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const TOTAL_MATCHES = 70;

const now = () => new Date().toISOString();

// -----------------------------
// 🛡 Snapshot validation (kept for safety)
// -----------------------------
function isValidSnapshot(payload) {
  if (!payload?.leaders?.length) return false;

  const validPoints = payload.leaders.every(
    (t) => typeof t.lastMatchPoints === "number"
  );

  const validTransfers = payload.leaders.every(
    (t) => t.transfersLeft !== null
  );

  return validPoints && validTransfers;
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
      await page.waitForTimeout(1500);

      let matchText = await page
        .$eval(
          ".m11c-scoreBoard__box .m11c-matchTxt",
          (el) => el.textContent.trim()
        )
        .catch(() => null);

      if (!matchText) {
        matchText = await page
          .$eval(".m11c-matchTxt", (el) => el.textContent.trim())
          .catch(() => null);
      }

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

        await row.scrollIntoViewIfNeeded();
        await row.click({ timeout: 5000 });

        await page.waitForFunction(() => {
          const el = document.querySelector(".m11c-pitch__fix-rgt em");
          return el && el.textContent.trim() !== "";
        }, { timeout: 10000 }).catch(() => {});

        await page.waitForTimeout(300);

        const matchPoints =
          parseFloat(
            await page
              .$eval(".m11c-pitch__fix-rgt em", (el) => el.innerText)
              .catch(() => "0")
          ) || 0;

        let transfersLeft = null;

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

                if (val) transfersLeft = parseInt(val.split("/")[0]);
              }
            }
          }
        } catch {}

        console.log(`📌 ${name} | Match: ${matchPoints} | Tx: ${transfersLeft}`);

        results.push({
          rank,
          name: name.trim(),
          points,
          lastMatchPoints: matchPoints,
          transfersLeft,
        });

        try {
          await page.keyboard.press("Escape");
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

    // ==============================
    // 🔥 FIX: ALWAYS persist to KV
    // ==============================
    if (!isValidSnapshot(payload)) {
      console.log("❌ Payload invalid, skipping push");
    } else {
      const res = await fetch(DASHBOARD_API, {
        method: "PUT", // ✅ changed
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 PUSH status:", res.status);
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