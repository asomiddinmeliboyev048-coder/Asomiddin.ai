import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export async function GET() {
  const base = path.join(process.env.LMS_DATA_DIR || process.cwd(), ".local", "lms");
  const read = async (name: string) => { try { return JSON.parse(await fs.readFile(path.join(base, name), "utf8")); } catch { return null; } };
  const [state, tasks, reminders] = await Promise.all([read("monitor-state.json"), read("all-course-tasks.json"), read("reminders.json")]);
  return NextResponse.json({ configured: Boolean(state || tasks), lastSync: state?.lastSyncAt ?? state?.last_sync_at ?? null, taskCount: Array.isArray(tasks?.tasks) ? tasks.tasks.length : Array.isArray(tasks) ? tasks.length : null, reminderCount: Array.isArray(reminders) ? reminders.length : Array.isArray(reminders?.reminders) ? reminders.reminders.length : null, note: "LMS operational files are available only on the worker host; configure a shared database for dashboard access." });
}
