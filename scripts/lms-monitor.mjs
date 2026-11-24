import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const base = process.env.LMS_DATA_DIR || process.cwd();
const dir = path.join(base, ".local", "lms");
await fs.mkdir(dir, { recursive: true });
const run = () => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["scripts/lms-read-all-tasks.mjs"], { stdio: "inherit", env: process.env });
  child.once("error", reject);
  child.once("exit", code => code === 0 ? resolve() : reject(new Error(`LMS reader exit ${code}`)));
});
const read = async (name, fallback) => { try { return JSON.parse(await fs.readFile(path.join(dir, name), "utf8")); } catch { return fallback; } };
await run();
const snapshot = await read("all-course-tasks.json", { capturedAt: new Date().toISOString(), courses: [], tasks: [] });
if (!(snapshot.courses || []).length) throw new Error("LMS kurslari topilmadi; mavjud monitoring holati saqlab qolindi.");
const previous = await read("monitor-state.json", { tasks: {} });
const old = previous.tasks || {};
if (Object.keys(old).length > 0 && !(snapshot.tasks || []).length && process.env.LMS_ALLOW_EMPTY_TASKS !== "true") {
  throw new Error("LMS 0 ta topshiriq qaytardi, oldingi monitoringda esa topshiriqlar bor. Noto‘g‘ri TASK_REMOVED hodisalarini oldini olish uchun sync bekor qilindi. Haqiqatan bo‘sh ro‘yxat kutilsa LMS_ALLOW_EMPTY_TASKS=true ni belgilang.");
}
const current = Object.fromEntries((snapshot.tasks || []).map(t => [String(t.id), t]));
const events = [];
for (const [id, task] of Object.entries(current)) {
  if (!old[id]) events.push({ type: "NEW_TASK", task, at: new Date().toISOString() });
  else if (old[id].dueAt !== task.dueAt) events.push({ type: "DEADLINE_CHANGED", task, before: old[id].dueAt, at: new Date().toISOString() });
  else if (old[id].title !== task.title || old[id].status !== task.status) events.push({ type: "TASK_UPDATED", task, at: new Date().toISOString() });
}
for (const [id, task] of Object.entries(old)) if (!current[id]) events.push({ type: "TASK_REMOVED", task, at: new Date().toISOString() });
const history = await read("monitor-history.json", []);
history.push(...events);
const reminders = (snapshot.tasks || []).flatMap(task => {
  if (!task.dueAt) return [];
  const due = new Date(task.dueAt);
  if (Number.isNaN(due.getTime())) return [];
  return [5,4].map(days => ({ taskId: task.id, title: task.title, dueAt: task.dueAt, daysBefore: days, remindAt: new Date(due.getTime()-days*86400000).toISOString() }));
});
const state = { lastSyncAt: new Date().toISOString(), tasks: current, courseCount: (snapshot.courses||[]).length, taskCount: Object.keys(current).length };
await Promise.all([
  fs.writeFile(path.join(dir,"monitor-state.json"),JSON.stringify(state,null,2)),
  fs.writeFile(path.join(dir,"monitor-history.json"),JSON.stringify(history.slice(-1000),null,2)),
  fs.writeFile(path.join(dir,"reminders.json"),JSON.stringify(reminders,null,2))
]);
console.log(`Monitor: ${state.courseCount} kurs, ${state.taskCount} topshiriq, ${events.length} o'zgarish`);
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const headers = { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" };
  const post = async (table, rows) => {
    if (!rows.length) return;
    const conflict = table === "lms_tasks" ? "?on_conflict=owner_id,external_id" : table === "lms_sync_status" ? "?on_conflict=owner_id" : table === "agent_reminders" ? "?on_conflict=owner_id,source_key" : "";
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}${conflict}`, { method:"POST", headers, body:JSON.stringify(rows) });
    if (!response.ok) throw new Error(`Supabase ${table}: ${response.status} ${await response.text()}`);
  };
  const owner = process.env.AI_OWNER_ID || "primary";
  await post("lms_tasks", (snapshot.tasks||[]).map(t => ({ owner_id:owner, external_id:String(t.id), course:t.course, title:t.title, url:t.url, due_at:t.dueAt, grade:t.grade, passing_grade:t.passingGrade, status:t.status, raw:t })));
  await post("lms_events", events.map(e => ({ owner_id:owner, event_type:e.type, external_id:String(e.task?.id || ""), payload:e, created_at:e.at })));
  await post("lms_sync_status", [{ owner_id:owner, last_sync_at:state.lastSyncAt, course_count:state.courseCount, task_count:state.taskCount, error:null }]);
  await post("agent_reminders", reminders.map(r => ({ owner_id:owner, source:"lms", source_key:`${r.taskId}:${r.daysBefore}`, title:`${r.title} — ${r.daysBefore} kun qoldi`, details:`Topshiriq muddati: ${r.dueAt}`, remind_at:r.remindAt, timezone:"Asia/Tashkent", channel:"push", status:"scheduled" })));
  console.log("[worker] Supabase bilan sinxronlandi");
} else console.warn("[worker] Supabase env yo'q; ma'lumotlar hozircha faqat worker diskida saqlanadi.");
