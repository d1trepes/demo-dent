const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const priceFormatter = new Intl.NumberFormat("ru-RU");

/** "2023-03-14" → "14 марта 2023 г." */
export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

/** 58000 → "58 000 ₽", с from — "от 58 000 ₽". */
export function formatPrice(value: number, from = false): string {
  if (value === 0) return "Бесплатно";
  return `${from ? "от " : ""}${priceFormatter.format(value)} ₽`;
}

/** 21 → "21 год", 3 → "3 года", 12 → "12 лет". */
export function formatYears(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word = mod10 === 1 && mod100 !== 11 ? "год" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "года" : "лет";
  return `${n} ${word}`;
}

/** 1 → forms[0], 3 → forms[1], 12 → forms[2]: «1 визит», «4 визита», «9 визитов». */
export function formatCount(n: number, forms: readonly [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const form = mod10 === 1 && mod100 !== 11 ? forms[0] : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? forms[1] : forms[2];
  return `${n} ${form}`;
}

const dayMonthFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });
const weekdayLongFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "long", timeZone: "UTC" });
const weekdayShortFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "short", timeZone: "UTC" });
const monthShortFormatter = new Intl.DateTimeFormat("ru-RU", { month: "short", timeZone: "UTC" });
const utcDay = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00Z`);

/** "2026-11-07" → "7 ноября". */
export const formatDayMonth = (date: string) => dayMonthFormatter.format(utcDay(date));
/** "2026-11-07" → "суббота". */
export const formatWeekday = (date: string) => weekdayLongFormatter.format(utcDay(date));
/** "2026-11-07" → "сб". */
export const formatWeekdayShort = (date: string) => weekdayShortFormatter.format(utcDay(date)).replace(".", "");
/** "2026-11-07" → "нояб". */
export const formatMonthShort = (date: string) => monthShortFormatter.format(utcDay(date)).replace(".", "");
/** "2026-11-07T10:30" → "10:30". */
export const timeOf = (start: string) => start.slice(11, 16);
/** "2026-11-07T10:30" → "7 ноября, суббота, 10:30". */
export const formatMoment = (start: string) => `${formatDayMonth(start)}, ${formatWeekday(start)}, ${timeOf(start)}`;
/** "Ковалёва Мария Андреевна" → "Ковалёва М. А.". */
export function shortName(fullName: string): string {
  const [surname, ...rest] = fullName.split(" ");
  return [surname, ...rest.map((p) => `${p[0]}.`)].join(" ");
}
/** "Ковалёва Мария Андреевна" → "КМ". */
export const initials = (fullName: string) => fullName.split(" ").slice(0, 2).map((p) => p[0]).join("");

/** Подстановка {name} в текст из JSON: fill("Стаж {years}", { years: "5 лет" }). */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
