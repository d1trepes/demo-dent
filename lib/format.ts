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
