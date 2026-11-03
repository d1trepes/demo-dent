const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const priceFormatter = new Intl.NumberFormat("ru-RU");

/** "2023-03-14" → "14 марта 2023 г." */
export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

/** 63000, 72000 → "63 000 – 72 000 ₽" (узкие неразрывные пробелы вокруг тире не ставим — переносится по тире). */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);
  return `${priceFormatter.format(min)} – ${priceFormatter.format(max)} ₽`;
}

/** 58000 → "58 000 ₽", с from — "от 58 000 ₽". */
export function formatPrice(value: number, from = false): string {
  if (value === 0) return "Бесплатно";
  return `${from ? "от " : ""}${priceFormatter.format(value)} ₽`;
}
