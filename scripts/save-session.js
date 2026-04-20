import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto('https://fantasy.iplt20.com/classic/league/view/66930102');

console.log('👉 Log in manually, then press ENTER here...');
await new Promise((resolve) => process.stdin.once('data', resolve));

await context.storageState({ path: 'state.json' });

console.log('✅ Session saved to state.json');

await browser.close();