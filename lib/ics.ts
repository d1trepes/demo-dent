/** Файл .ics для «Добавить в календарь»: собирается и скачивается в браузере, никуда не отправляется. */
import { shiftMoment } from "./dates";

/** Екатеринбург — UTC+5 без перехода на летнее время (в UTC переводим вручную, без VTIMEZONE). */
const CLINIC_UTC_OFFSET_H = 5;

function toUtcStamp(moment: string): string {
  const [date, time] = moment.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, hh - CLINIC_UTC_OFFSET_H, mm));
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/[;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export type IcsEvent = {
  uid: string;
  start: string;
  durationMin: number;
  summary: string;
  description: string;
  location: string;
};

export function buildIcs(event: IcsEvent): string {
  const end = shiftMoment(event.start, event.durationMin);
  const alarm = (trigger: string) => ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Приём в клинике", `TRIGGER:${trigger}`, "END:VALARM"];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yasen Dent Demo//RU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@yasen-dent.demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${toUtcStamp(event.start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    ...alarm("-PT24H"),
    ...alarm("-PT2H"),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Скачивает файл локально: Blob → временная ссылка. */
export function downloadIcs(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
