import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.LMS_DATA_DIR || process.cwd();
const authPath = path.join(base, ".auth", "lms-storage-state.json");
const outDir = path.join(base, ".local", "lms");
await fs.mkdir(outDir, { recursive: true });
await fs.access(authPath);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: authPath });
const page = await context.newPage();
const origin = process.env.LMS_URL || "https://lms.tuit.uz";
const maxPages = Number(process.env.LMS_MAX_COURSES || 40);
const visited = new Set();
const courses = [];
const tasks = [];
const clean = s => (s || "").replace(/\\s+/g, " ").trim();
try {
  await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (/login|oneid/i.test(page.url()) || await page.locator('input[type="password"]').count()) {
    throw new Error("LMS sessiyasi yaroqsiz yoki muddati tugagan. scripts/lms-login.mjs orqali qayta kiring.");
  }
  const links = await page.locator('a[href]').evaluateAll(as => as.map(a => ({ text: (a.innerText || "").replace(/\\s+/g, " ").trim(), href: a.href })).filter(x => x.href.startsWith(origin) && x.text));
  const courseLinks = links.filter(x => /course|kurs|mod|fan/i.test(x.href + " " + x.text)).slice(0, maxPages);
  for (const link of courseLinks) {
    if (visited.has(link.href)) continue;
    visited.add(link.href);
    try {
      await page.goto(link.href, { waitUntil: "domcontentloaded", timeout: 45000 });
      const title = clean(await page.locator("h1").first().textContent().catch(() => "")) || link.text;
      const body = await page.locator("body").innerText().catch(() => "");
      courses.push({ title, url: link.href });
      const rows = await page.locator('a[href], li, tr, .activity, .activity-item, .course-section').evaluateAll(els => els.map(el => {
        const text = (el.innerText || "").replace(/\\s+/g, " ").trim();
        const a = el.matches("a") ? el : el.querySelector("a[href]");
        return { title: text.slice(0, 500), url: a?.href || "", tag: el.tagName.toLowerCase() };
      }).filter(x => x.title && /task|assignment|topshiriq|vazifa|deadline|due|muddat/i.test(x.title)));
      for (const row of rows) {
        const key = row.url || row.title;
        if (!tasks.some(t => t.course === title && (t.url || t.title) === key)) tasks.push({ id: row.url || `${title}:${row.title}`, course: title, title: row.title, url: row.url || null, dueAt: null, grade: null, passingGrade: null, status: "unknown", source: "lms-dom" });
      }
      if (!body) console.warn("Bo'sh sahifa:", link.href);
    } catch (error) { console.warn("Kurs o'qilmadi:", link.href, error.message); }
  }
  const payload = { capturedAt: new Date().toISOString(), source: origin, courses, tasks, warnings: courseLinks.length ? [] : ["Kurs havolalari avtomatik topilmadi; LMS sahifa tuzilmasiga mos selector kerak."] };
  await fs.writeFile(path.join(outDir, "all-course-tasks.json"), JSON.stringify(payload, null, 2));
  console.log(`LMS o'qildi: ${courses.length} kurs, ${tasks.length} topshiriq`);
  if (!courses.length) console.warn("Kurslar aniqlanmadi. Selectorlarni LMS HTML tuzilmasiga moslash talab qilinishi mumkin.");
} finally { await browser.close(); }
