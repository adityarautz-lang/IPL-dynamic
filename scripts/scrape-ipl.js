import { chromium } from "playwright";

const DASHBOARD_API =
  process.env.TARGET === "local"
    ? "http://localhost:3000/api/ipl"
    : "https://ipl-dynamic.vercel.app/api/ipl";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

const TOTAL_MATCHES = 70;

const now = () => new Date().toISOString();

// ======================================
// 🛠 HELPERS
// ======================================

function normalizeImage(url) {
  if (!url) return null;

  if (
    url.startsWith(
      "/classic/static-assets"
    )
  ) {
    return `https://fantasy.iplt20.com${url}`;
  }

  if (!url.startsWith("http")) {
    return null;
  }

  return url;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

function isValidPayload(payload) {
  return (
    payload?.leaders?.length > 0
  );
}

// ======================================
// 🚀 MAIN
// ======================================

async function scrapeIPL() {
  console.log(
    `\n==============================`
  );

  console.log(
    `🚀 START scrape at: ${now()}`
  );

  console.log(
    "🌍 TARGET:",
    process.env.TARGET
  );

  console.log(
    "🌍 DASHBOARD_API:",
    DASHBOARD_API
  );

  console.log(
    "🌍 SNAPSHOT:",
    process.env.SNAPSHOT
  );

  // ======================================
  // 🌐 CONNECTIVITY TEST
  // ======================================

  try {
    const ping = await fetch(
      "https://fantasy.iplt20.com",
      {
        method: "HEAD",
      }
    );

    console.log(
      "🌐 Connectivity OK:",
      ping.status
    );
  } catch (err) {
    console.log(
      "❌ Connectivity failed"
    );

    throw err;
  }

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

  let page =
    await context.newPage();

  try {
    // ======================================
    // 🌐 RETRY PAGE LOAD
    // ======================================

    let loaded = false;

    for (
      let attempt = 1;
      attempt <= 3;
      attempt++
    ) {
      try {
        console.log(
          `🌐 Loading page attempt ${attempt}`
        );

        await page.goto(
          TARGET_URL,
          {
            waitUntil:
              "domcontentloaded",

            timeout: 45000,
          }
        );

        await page.waitForSelector(
          "#leadersList li",
          {
            timeout: 15000,
          }
        );

        loaded = true;

        console.log(
          "✅ IPL page loaded"
        );

        break;
      } catch (err) {
        console.log(
          `⚠️ goto failed attempt ${attempt}`
        );

        console.log(err.message);

        try {
          await page.close();
        } catch {}

        page =
          await context.newPage();

        await page.waitForTimeout(
          5000
        );
      }
    }

    if (!loaded) {
      throw new Error(
        "Could not load IPL page after retries"
      );
    }

    // ======================================
    // 📊 MATCH PROGRESS
    // ======================================

    let currentMatch = null;
    let completedMatches = null;
    let completedPct = null;

    try {
      const matchText =
        await page
          .$eval(
            ".m11c-matchTxt",
            (el) =>
              el.textContent?.trim()
          )
          .catch(() => null);

      if (matchText) {
        const matchNumber =
          matchText.match(/\d+/);

        if (matchNumber) {
          currentMatch =
            safeNumber(
              matchNumber[0],
              null
            );

          completedMatches =
            currentMatch - 1;

          completedPct =
            (completedMatches /
              TOTAL_MATCHES) *
            100;
        }
      }
    } catch {}

    console.log("📊 Match:", {
      currentMatch,
      completedPct,
    });

    const rows = await page.$$(
      "#leadersList li"
    );

    console.log(
      `📊 Rows found: ${rows.length}`
    );

    const results = [];

    // ======================================
    // 🧠 SCRAPE ROWS
    // ======================================

    for (
      let i = 0;
      i < rows.length;
      i++
    ) {
      try {
        const row = rows[i];

        const rank =
          safeNumber(
            parseInt(
              (
                await row
                  .$eval(
                    ".m11c-matchCount",
                    (el) =>
                      el.innerText
                  )
                  .catch(
                    () => "999"
                  )
              ).trim(),
              10
            )
          );

        const name =
          await row
            .$eval(
              ".m11c-plyrSel__name span",
              (el) =>
                el.innerText
            )
            .catch(() => "");

        const points =
          safeNumber(
            parseFloat(
              (
                await row
                  .$eval(
                    ".m11c-tbl__cell--pts span",
                    (el) =>
                      el.innerText
                  )
                  .catch(
                    () => "0"
                  )
              ).replace(/,/g, "")
            )
          );

        console.log(
          `\n🟢 Opening team: ${name}`
        );

        await row.scrollIntoViewIfNeeded();

        await row.click({
          timeout: 5000,
        });

        // ======================================
        // 🧠 WAIT FOR MODAL
        // ======================================

        await page.waitForSelector(
          ".m11c-pitch__plyr",
          {
            timeout: 10000,
          }
        );

        await page.waitForTimeout(
          1500
        );

        // ======================================
        // 🎯 MATCH POINTS
        // ======================================

        const rawMatchPoints =
          await page
            .$eval(
              ".m11c-pitch__fix-rgt em",
              (el) =>
                el.innerText
            )
            .catch(() => null);

        console.log(
          "🎯 RAW MATCH POINTS:",
          name,
          rawMatchPoints
        );

        const cleanedPoints =
          rawMatchPoints === "-"
            ? "0"
            : rawMatchPoints;

        const matchPoints =
          safeNumber(
            parseFloat(
              cleanedPoints ||
                "0"
            )
          );

        // ======================================
        // 👑 CAPTAIN / VC
        // ======================================

        let captain = null;
        let viceCaptain = null;

        const players =
          await page.$$(
            ".m11c-pitch__plyr"
          );

        for (const player of players) {
          const className =
            (await player.getAttribute(
              "class"
            )) || "";

          const playerName =
            await player
              .$eval(
                ".m11c-pitch__plyr-name span",
                (el) =>
                  el.innerText
              )
              .catch(() => "");

          const playerPoints =
            safeNumber(
              parseInt(
                await player
                  .$eval(
                    ".m11c-pitch__plyr-num span",
                    (el) =>
                      el.innerText
                  )
                  .catch(
                    () => "0"
                  )
              )
            );

          const image =
            await player.evaluate(
              async (el) => {
                const thumb =
                  el.querySelector(
                    ".m11c-pitch__plyr-thumb"
                  );

                if (!thumb)
                  return null;

                function extract(
                  bg
                ) {
                  if (
                    !bg ||
                    bg === "none"
                  )
                    return null;

                  const match =
                    bg.match(
                      /url\(["']?(.*?)["']?\)/
                    );

                  return match
                    ? match[1]
                    : null;
                }

                let style =
                  thumb.getAttribute(
                    "style"
                  );

                let img =
                  extract(style);

                if (img)
                  return img;

                let computed =
                  window.getComputedStyle(
                    thumb
                  ).backgroundImage;

                img =
                  extract(
                    computed
                  );

                return img;
              }
            );

          const normalizedImage =
            normalizeImage(
              image
            );

          if (
            className.includes(
              "m11c-cap"
            )
          ) {
            captain = {
              name:
                playerName.trim() ||
                "Unknown",

              points:
                playerPoints,

              image:
                normalizedImage,
            };
          }

          if (
            className.includes(
              "m11c-vcap"
            )
          ) {
            viceCaptain = {
              name:
                playerName.trim() ||
                "Unknown",

              points:
                playerPoints,

              image:
                normalizedImage,
            };
          }
        }

        // ======================================
        // 🔄 TRANSFERS
        // ======================================

        let transfersLeft =
          null;

        let boostersUsed =
          null;

        try {
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
            700
          );

          const transferBlock =
            await page.$(
              ".m11c-transfer__head"
            );

          if (transferBlock) {
            const spans =
              await transferBlock.$$(
                "span"
              );

            for (const span of spans) {
              const text =
                await span.innerText();

              if (
                text.includes(
                  "Transfers Left"
                )
              ) {
                const val =
                  await span
                    .$eval(
                      "em",
                      (el) =>
                        el.innerText
                    )
                    .catch(
                      () => null
                    );

                if (val) {
                  transfersLeft =
                    safeNumber(
                      parseInt(
                        val.split(
                          "/"
                        )[0]
                      ),
                      null
                    );
                }
              }

              if (
                text.includes(
                  "Boosters used"
                )
              ) {
                boostersUsed =
                  await span
                    .$eval(
                      "em",
                      (el) =>
                        el.innerText
                    )
                    .catch(
                      () => null
                    );
              }
            }
          }
        } catch {}

        console.log("DEBUG:", {
          name,
          matchPoints,
          captainImage:
            captain?.image,
          transfersLeft,
        });

        results.push({
          rank,

          name: name.trim(),

          points,

          lastMatchPoints:
            matchPoints,

          transfersLeft,

          boostersUsed,

          captain,

          viceCaptain,
        });

        // ======================================
        // ❌ CLOSE MODAL
        // ======================================

        try {
          await page.keyboard.press(
            "Escape"
          );

          await page.waitForTimeout(
            1000
          );
        } catch {}
      } catch (err) {
        console.log(
          `⚠️ Row ${i} failed`
        );

        console.log(err);
      }
    }

    // ======================================
    // 📦 PAYLOAD
    // ======================================

    const payload = {
      updatedAt: now(),

      leaders: results,

      currentMatch,

      completedMatches,

      completedPct,
    };

    console.log(
      "📦 Payload ready"
    );

    console.log(
      "📦 Leaders:",
      payload.leaders.length
    );

    console.log(
      "📦 First Leader:",
      payload.leaders?.[0]
    );

    console.log(
      "🧪 Payload sample:",
      JSON.stringify(
        payload.leaders[1],
        null,
        2
      )
    );

    if (!isValidPayload(payload)) {
      console.log(
        "❌ Payload invalid"
      );

      return;
    }

    // ======================================
    // 🚀 SNAPSHOT / LIVE
    // ======================================

    const isSnapshot =
      process.env.SNAPSHOT ===
      "true";

    const method =
      isSnapshot
        ? "PUT"
        : "POST";

    console.log(
      `📡 Sending ${
        isSnapshot
          ? "SNAPSHOT"
          : "LIVE"
      } update`
    );

    console.log(
      "📡 URL:",
      DASHBOARD_API
    );

    const res = await fetch(
      DASHBOARD_API,
      {
        method,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-cache",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

    const text =
      await res.text();

    console.log(
      `📡 ${method} status:`,
      res.status
    );

    console.log(
      "📨 Response:",
      text
    );

    if (!res.ok) {
      console.log(
        "❌ API returned non-200"
      );
    } else {
      console.log(
        "✅ API accepted payload"
      );
    }
  } catch (err) {
    console.error(
      "❌ Fatal error:",
      err
    );
  } finally {
    await browser.close();

    console.log(
      `🏁 END scrape at: ${now()}`
    );

    console.log(
      `==============================\n`
    );
  }
}

export default scrapeIPL;

if (
  process.argv[1]?.includes(
    "scrape-ipl"
  )
) {
  scrapeIPL();
}