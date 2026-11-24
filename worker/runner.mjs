import { spawn } from "node:child_process";

const interval = Number(process.env.LMS_SYNC_INTERVAL_MS || 21_600_000);
if (!Number.isFinite(interval) || interval < 60_000) throw new Error("LMS_SYNC_INTERVAL_MS must be at least 60000");
let running = false;
let stopping = false;

async function syncOnce() {
  if (running || stopping) return;
  running = true;
  const started = new Date().toISOString();
  console.log(`[worker] LMS sync started ${started}`);
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["scripts/lms-monitor.mjs"], { stdio: "inherit", env: process.env });
      child.once("error", reject);
      child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`LMS monitor exited: code=${code}, signal=${signal}`)));
    });
    console.log(`[worker] LMS sync completed ${new Date().toISOString()}`);
  } catch (error) {
    console.error("[worker] LMS sync failed:", error);
  } finally { running = false; }
}

process.on("SIGTERM", () => { stopping = true; console.log("[worker] SIGTERM received"); process.exit(0); });
process.on("SIGINT", () => { stopping = true; console.log("[worker] SIGINT received"); process.exit(0); });
console.log(`[worker] started; interval=${interval}ms; timezone=${process.env.TZ || "system"}`);
await syncOnce();
setInterval(syncOnce, interval);
