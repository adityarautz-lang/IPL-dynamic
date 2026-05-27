import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "prod"
    ? "https://ipl-dynamic.vercel.app/api/ipl/history-test"
    : "http://localhost:3000/api/ipl/history-test";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const now = () => new Date().toISOString();

function safeNumber(value, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

async function scrapeHistory() {
  console.log(
    "📊 Starting per-match history scrape..."
  );

  const browser =
    await chromium.launch({
      headless: true,

      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

  const context =
    await browser.newContext({
      storageState: "state.json",
    });

  const page =
    await context.newPage();

  try {
    // ======================================
    // 🌐 LOAD PAGE
    // ======================================

    await page.goto(TARGET_URL, {
      waitUntil:
        "domcontentloaded",

      timeout: 45000,
    });

    await page.waitForSelector(
      "#leadersList li",
      {
        timeout: 30000,
      }
    );

    // ======================================
    // 📊 TOTAL TEAMS
    // ======================================

    const totalTeams =
      await page.$$eval(
        "#leadersList li",
        (els) => els.length
      );

    console.log(
      "📊 Teams found:",
      totalTeams
    );

    const allTeams = [];

    // ======================================
    // 🧠 LOOP TEAMS
    // ======================================

    for (
      let i = 0;
      i < totalTeams;
      i++
    ) {
      try {
        // ======================================
        // 🔄 RE-QUERY ROWS EACH LOOP
        // ======================================

        const teams =
          await page.$$(
            "#leadersList li"
          );

        const row = teams[i];

        const teamName =
          await row
            .$eval(
              ".m11c-plyrSel__name span",
              (el) =>
                el.innerText.trim()
            )
            .catch(
              () => `Team-${i}`
            );

        console.log(
          "\n👉",
          teamName
        );

        // ======================================
        // 🟢 CLICK WITH RETRIES
        // ======================================

        let clicked = false;

        for (
          let retry = 1;
          retry <= 3;
          retry++
        ) {
          try {
            await row.scrollIntoViewIfNeeded();

            await page.waitForTimeout(
              500
            );

            await row.click({
              timeout: 10000,
            });

            clicked = true;

            break;
          } catch (err) {
            console.log(
              `⚠️ click retry ${retry}`
            );

            await page.waitForTimeout(
              1000
            );
          }
        }

        if (!clicked) {
          throw new Error(
            `Could not click ${teamName}`
          );
        }

        // ======================================
        // 🧠 WAIT FOR MODAL
        // ======================================

        await page.waitForSelector(
          ".m11c-overlay__header",
          {
            timeout: 10000,
          }
        );

        await page.waitForTimeout(
          1200
        );

        // ======================================
        // 📊 CLICK OVERALL TAB
        // ======================================

        const tabs =
          await page.$$(
            "li.swiper-slide"
          );

        for (const tab of tabs) {
          const text =
            await tab.innerText();

          if (
            text
              .trim()
              .toUpperCase() ===
            "OVERALL"
          ) {
            await tab.click();

            break;
          }
        }

        await page.waitForTimeout(
          1200
        );

        const scrollContainer =
          await page.$(
            ".m11c-pitch__area"
          );

        let results = [];

        let seen = new Set();

        let lastScrollTop =
          -1;

        // ======================================
        // 🔄 SCROLL HISTORY
        // ======================================

        while (true) {
          const matches =
            await page.$$(
              ".m11c-contest__box"
            );

          for (const match of matches) {
            const matchName =
              await match
                .$eval(
                  ".m11c-contest__box-head span",
                  (el) =>
                    el.innerText.trim()
                )
                .catch(() => "");

            if (
              !matchName ||
              seen.has(matchName)
            )
              continue;

            // ======================================
            // 🧪 DEBUG SPANS
            // ======================================

            const spans =
              await match.$$eval(
                ".m11c-contest__pitch-num span",
                (els) =>
                  els.map((el) =>
                    el.innerText.trim()
                  )
              );

            console.log(
              "🧪 HISTORY SPANS:",
              matchName,
              spans
            );

            // ======================================
            // 🎯 FIX COMMA PARSING
            // ======================================

            const numericValues =
              spans
                .map((v) =>
                  parseFloat(
                    v.replace(
                      /,/g,
                      ""
                    )
                  )
                )
                .filter(
                  (v) =>
                    !isNaN(v)
                );

            const points =
              numericValues.length >
              0
                ? Math.max(
                    ...numericValues
                  )
                : 0;

            seen.add(matchName);

            results.push({
              matchIndex:
                results.length +
                1,

              matchName,

              points:
                safeNumber(
                  points
                ),
            });
          }

          // ======================================
          // 🔽 SCROLL
          // ======================================

          const scrollTop =
            await scrollContainer.evaluate(
              (el) => el.scrollTop
            );

          await scrollContainer.evaluate(
            (el) =>
              (el.scrollTop += 300)
          );

          await page.waitForTimeout(
            700
          );

          const newScrollTop =
            await scrollContainer.evaluate(
              (el) => el.scrollTop
            );

          if (
            newScrollTop ===
            lastScrollTop
          )
            break;

          lastScrollTop =
            newScrollTop;
        }

        // ======================================
        // 📦 SAVE TEAM
        // ======================================

        allTeams.push({
          teamName,

          history:
            results.reverse(),
        });

        console.log(
          `✅ ${teamName} → ${results.length} matches`
        );

        // ======================================
        // ❌ CLOSE MODAL
        // ======================================

        await page.keyboard.press(
          "Escape"
        );

        await page.waitForTimeout(
          1000
        );
      } catch (err) {
        console.log(
          `❌ Team ${i} failed`
        );

        console.log(err.message);
      }
    }

    // ======================================
    // 📦 FINAL PAYLOAD
    // ======================================

    console.log(
      "\n📦 Done:",
      allTeams.length
    );

    const payload = {
      updatedAt: now(),

      teams: allTeams,
    };

    // ======================================
    // 🚀 SEND
    // ======================================

    const res = await fetch(
      DASHBOARD_API,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

    const text =
      await res.text();

    console.log(
      "📡 History status:",
      res.status
    );

    console.log(
      "📨 Response:",
      text
    );

    if (!res.ok) {
      console.log(
        "❌ History save failed"
      );
    } else {
      console.log(
        "✅ History saved"
      );
    }
  } catch (err) {
    console.error(
      "❌ Fatal error:",
      err.message
    );
  } finally {
    await browser.close();
  }
}

scrapeHistory();