/**
 * Даты без часовых поясов браузера: всё считаем во времени клиники (Екатеринбург).
 * День — "YYYY-MM-DD", время — "HH:mm", момент — "YYYY-MM-DDTHH:mm".
 */
import type { RelativeMoment, Weekday } from "./types";

export const CLINIC_TIME_ZONE = "Asia/Yekaterinburg";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Текущие день и время в клинике. */
export function clinicNow(now: Date = new Date()): { date: string; time: string } {
  const p = Object.fromEntries(partsFormatter.formatToParts(now).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

function parseDay(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date: string, days: number): string {
  const d = parseDay(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 1 — понедельник … 7 — воскресенье. */
export function weekdayOf(date: string): Weekday {
  const js = parseDay(date).getUTCDay();
  return (js === 0 ? 7 : js) as Weekday;
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function moment(date: string, time: string): string {
  return `${date}T${time}`;
}

/** Момент из смещения «сегодня ± N дней» (для моков). */
export function fromRelative(rel: RelativeMoment, today: string = clinicNow().date): string {
  return moment(addDays(today, rel.day), rel.time);
}

/** Сегодняшний день, сдвинутый на N дней (для моков без времени). */
export function relativeDay(day: number, today: string = clinicNow().date): string {
  return addDays(today, day);
}
