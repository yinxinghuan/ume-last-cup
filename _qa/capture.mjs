import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const out = new URL('./ui/first-pass/', import.meta.url).pathname;
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function capturePrimary() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('.mp4')) errors.push(`console: ${message.text()}`);
  });
  await page.goto('http://127.0.0.1:5238/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/entry-390x844.png`, fullPage: true });

  for (let index = 0; index < 5; index += 1) {
    await page.locator('.ulc-hotspot').nth(index).click();
    if (index === 0) {
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${out}/video-melon-390x844.png`, fullPage: true });
      await page.waitForTimeout(4500);
    } else {
      await page.waitForTimeout(7000);
    }
  }

  await page.locator('.ulc-climax').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(550);
  await page.screenshot({ path: `${out}/climax-ready-390x844.png`, fullPage: true });
  await page.locator('.ulc-climax button').click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/climax-video-390x844.png`, fullPage: true });
  await page.locator('.ulc-result').waitFor({ state: 'visible', timeout: 12000 });
  await page.waitForTimeout(550);
  await page.screenshot({ path: `${out}/result-390x844.png`, fullPage: true });
  return errors;
}

async function captureNarrowEnglish() {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => localStorage.setItem('game_locale', 'en'));
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5238/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/entry-en-320x568.png`, fullPage: true });
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    buttons: [...document.querySelectorAll('button')].map((button) => {
      const rect = button.getBoundingClientRect();
      return { label: button.getAttribute('aria-label') ?? button.textContent?.trim(), width: rect.width, height: rect.height };
    }),
  }));
  await context.close();
  return metrics;
}

const errors = await capturePrimary();
const metrics = await captureNarrowEnglish();
console.log(JSON.stringify({ errors, metrics }, null, 2));
await browser.close();
