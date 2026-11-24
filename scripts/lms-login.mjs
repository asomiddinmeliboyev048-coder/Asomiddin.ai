import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const base = process.env.LMS_DATA_DIR || process.cwd();
const authDir = path.join(base, ".auth");
const authPath = path.join(authDir, "lms-storage-state.json");
const origin = process.env.LMS_URL || "https://lms.tuit.uz";
const timeoutMs = Number(process.env.LMS_LOGIN_TIMEOUT_MS || 10 * 60 * 1000);

if (!Number.isFinite(timeoutMs) || timeoutMs < 60_000) {
  throw new Error("LMS_LOGIN_TIMEOUT_MS kamida 60000 bo‘lishi kerak.");
}

await fs.mkdir(authDir, { recursive: true });
const browser = await chromium.launch({
  headless: process.env.LMS_HEADLESS === "true",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({ timezoneId: "Asia/Tashkent" });
const page = await context.newPage();
const rl = readline.createInterface({ input, output });

try {
  console.log("\nASOMIDDIN AI — TATU LMS qo‘lda autentifikatsiya");
  console.log("OneID va CAPTCHA bosqichlarini faqat o‘zingiz bajaring.");
  console.log("Skript parol yoki CAPTCHA ma'lumotlarini saqlamaydi.\n");

  await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await rl.question("Brauzerda LMS hisobingizga kirishni tugatib, shu yerda Enter bosing... ");

  const deadline = Date.now() + timeoutMs;
  let authenticated = false;
  while (Date.now() < deadline) {
    const currentUrl = page.url();
    const passwordFields = await page.locator('input[type="password"]').count().catch(() => 0);
    const onLoginPage = /login|oneid|auth/i.test(currentUrl);
    if (!onLoginPage && passwordFields === 0) {
      const title = (await page.title().catch(() => "")).toLowerCase();
      const body = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
      if (!/войти|kirish|sign in|login/.test(title) && !/войти|kirish|sign in|login/.test(body.slice(0, 250))) {
        authenticated = true;
        break;
      }
    }
    await page.waitForTimeout(1200);
  }

  if (!authenticated) {
    throw new Error("Kirish tasdiqlanmadi. LMS shaxsiy kabineti ochilganini tekshiring va qayta urinib ko‘ring.");
  }

  await context.storageState({ path: authPath });
  await fs.chmod(authPath, 0o600).catch(() => {});
  console.log(`\nSessiya saqlandi: ${authPath}`);
  console.log("Fayl maxfiy. Uni GitHub'ga yubormang yoki hech kimga bermang.");
  console.log("Keyingi buyruq: npm run lms:sync");
} finally {
  rl.close();
  await browser.close();
}
