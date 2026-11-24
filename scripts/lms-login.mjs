import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.LMS_DATA_DIR || process.cwd();
const authDir = path.join(base, ".auth");
await fs.mkdir(authDir, { recursive: true });
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(process.env.LMS_URL || "https://lms.tuit.uz", { waitUntil: "domcontentloaded" });
console.log("LMS sahifasi ochildi. Login va CAPTCHA'ni o'zingiz qo'lda bajaring.");
console.log("Muvaffaqiyatli kirganingizdan so'ng terminalda Enter bosing.");
process.stdin.setEncoding("utf8");
await new Promise(resolve => process.stdin.once("data", resolve));
await context.storageState({ path: path.join(authDir, "lms-storage-state.json") });
console.log("Login sessiyasi saqlandi:", path.join(authDir, "lms-storage-state.json"));
await browser.close();
