import Link from "next/link";
import type { ServicesIndexContent } from "@/lib/types";
import styles from "./ServicesAside.module.css";

type Props = {
  texts: Omit<ServicesIndexContent, "cards">;
  query: string;
  category: string;
  /** Счётчики по разделам с учётом поиска. */
  counts: Record<string, number>;
  onQuery: (value: string) => void;
  onCategory: (id: string) => void;
};

/** Липкая белая плашка: поиск всегда виден, ниже разделы со счётчиком и подсказка «к кому идти». */
export function ServicesAside({ texts, query, category, counts, onQuery, onCategory }: Props) {
  return (
    <aside className={styles.aside}>
      <div className={styles.search}>
        <label className="visually-hidden" htmlFor="services-search">
          {texts.searchLabel}
        </label>
        <input
          id="services-search"
          className={styles.input}
          type="text"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={texts.searchShort}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
        {query && <button type="button" className={styles.clear} aria-label={texts.clear} onClick={() => onQuery("")} />}
      </div>

      <div className={styles.cats} role="group" aria-label={texts.categoriesLabel}>
        {texts.categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.cat}
            aria-pressed={c.id === category}
            disabled={counts[c.id] === 0}
            onClick={() => onCategory(c.id)}
          >
            <span>{c.label}</span>
            <span className={styles.count}>{counts[c.id]}</span>
          </button>
        ))}
      </div>

      <div className={styles.note}>
        <b className={styles.noteTitle}>{texts.aside.title}</b>
        <p className={styles.noteText}>{texts.aside.text}</p>
        <Link href={texts.aside.href} className={styles.noteLink}>
          {texts.aside.link}
        </Link>
      </div>
    </aside>
  );
}
