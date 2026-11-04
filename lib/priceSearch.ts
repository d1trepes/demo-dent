import type { PriceItem } from "./types";

const normalize = (value: string) => value.toLowerCase().replace(/ё/g, "е");

/** Основы слов запроса: «удалить зуб» → ["удалит", "зуб"]. Слово обрезается на 2 буквы, но не короче 3. */
export function queryStems(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.slice(0, Math.max(3, word.length - 2)));
}

/** Позиция подходит, если каждая основа есть в названии или синонимах. Пустой запрос подходит всем. */
export function matchesItem(item: Pick<PriceItem, "title" | "synonyms">, stems: string[]): boolean {
  if (!stems.length) return true;
  const haystack = normalize(`${item.title} ${item.synonyms.join(" ")}`);
  return stems.every((stem) => haystack.includes(stem));
}

export type TitlePart = { text: string; hit: boolean };

/** Делит название на куски, совпавшие с основами (для <mark>). Длина строки при нормализации не меняется. */
export function highlightTitle(title: string, stems: string[]): TitlePart[] {
  if (!stems.length) return [{ text: title, hit: false }];
  const lower = normalize(title);
  const marked = new Array<boolean>(title.length).fill(false);
  for (const stem of stems) {
    let from = lower.indexOf(stem);
    while (from !== -1) {
      for (let i = from; i < from + stem.length; i += 1) marked[i] = true;
      from = lower.indexOf(stem, from + 1);
    }
  }
  const parts: TitlePart[] = [];
  for (let i = 0; i < title.length; i += 1) {
    const last = parts[parts.length - 1];
    if (last && last.hit === marked[i]) last.text += title[i];
    else parts.push({ text: title[i], hit: marked[i] });
  }
  return parts;
}

/** Слово по числу: 1 → forms[0], 3 → forms[1], 12 → forms[2]. */
export function pluralWord(n: number, forms: readonly [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
