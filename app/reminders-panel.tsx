"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Bell, Plus, RefreshCw } from "lucide-react";

type Reminder = { id: string; title: string; details?: string | null; remind_at: string; status: string; channel: string };
const formatDate = (value: string) => new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" }).format(new Date(value));

export default function RemindersPanel() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/agent/reminders", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Eslatmalarni yuklab bo‘lmadi");
      setItems(body.reminders || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !when) return;
    setBusy(true); setError("");
    try {
      const remindAt = new Date(when);
      if (Number.isNaN(remindAt.getTime()) || remindAt.getTime() <= Date.now()) throw new Error("Eslatma vaqti kelajakda bo‘lishi kerak.");
      const response = await fetch("/api/agent/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), details: details.trim() || undefined, remindAt: remindAt.toISOString(), channel: "push", source: "user" }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || body.error || "Eslatma saqlanmadi");
      setTitle(""); setDetails(""); setWhen(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); }
    finally { setBusy(false); }
  }
  return <section className="section panel">
    <div className="sectiontitle"><h2><Bell size={18}/> Aqlli eslatmalar</h2><button className="refresh" type="button" onClick={() => void load()}><RefreshCw size={15}/> Yangilash</button></div>
    <form className="reminder-form" onSubmit={submit}>
      <input value={title} onChange={e => setTitle(e.target.value)} maxLength={240} placeholder="Masalan: TATU topshirig‘ini topshirish" required />
      <input value={details} onChange={e => setDetails(e.target.value)} maxLength={2000} placeholder="Izoh (ixtiyoriy)" />
      <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} required />
      <button className="refresh" disabled={busy || !title.trim() || !when}><Plus size={16}/>{busy ? "Saqlanmoqda…" : "Eslatma qo‘shish"}</button>
    </form>
    {error && <p className="login-error">{error}</p>}
    {items.length ? items.slice(0, 8).map(item => <div className="task" key={item.id}><div><b>{item.title}</b>{item.details && <p className="muted">{item.details}</p>}</div><span className="pill">{formatDate(item.remind_at)} · {item.status}</span></div>) : <p className="muted">Hozircha eslatmalar yo‘q.</p>}
    <p className="chat-footnote">Eslatmalar bazada saqlanadi. Push-bildirishnoma yuborish uchun alohida dispatcher va qurilma tokeni hali ulanishi kerak.</p>
  </section>;
}
