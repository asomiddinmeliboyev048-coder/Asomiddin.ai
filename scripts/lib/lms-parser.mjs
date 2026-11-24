export const clean = (value = "") => String(value).replace(/\s+/g, " ").trim();

export function dateFromText(value = "") {
  const match = String(value).match(/(?:due|deadline|muddat|topshirish|until|to)\D{0,25}(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?:\s+\d{1,2}:\d{2})?)/i);
  if (!match) return null;
  const parts = match[1].match(/\d+/g).map(Number);
  const [day, month, rawYear, hour = 23, minute = 59] = parts;
  const year = rawYear < 100 ? rawYear + 2000 : rawYear;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  const iso = String(year).padStart(4, "0") + "-" +
    String(month).padStart(2, "0") + "-" +
    String(day).padStart(2, "0") + "T" +
    String(hour).padStart(2, "0") + ":" +
    String(minute).padStart(2, "0") + ":00+05:00";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return date.toISOString();
}

export function inferTaskStatus(context = "", dueAt = null, now = Date.now()) {
  if (/graded|оценено|baholandi|baholangan/i.test(context)) return "graded";
  if (/submitted|отправлено|topshirildi|yuborildi/i.test(context)) return "submitted";
  if (!dueAt) return "unknown";
  const timestamp = new Date(dueAt).getTime();
  if (Number.isNaN(timestamp)) return "unknown";
  return timestamp < now ? "overdue" : "upcoming";
}
