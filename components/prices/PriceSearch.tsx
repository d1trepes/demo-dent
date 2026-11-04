import { cx } from "@/lib/cx";
import type { PricesContent } from "@/lib/types";
import styles from "./PriceSearch.module.css";

type Props = {
  query: string;
  texts: PricesContent;
  onChange: (value: string) => void;
};

export function PriceSearch({ query, texts, onChange }: Props) {
  const active = query.trim().length > 0;
  return (
    <div className={styles.search}>
      <label className="visually-hidden" htmlFor="price-search">
        {texts.searchLabel}
      </label>
      <div className={styles.field}>
      <input
        id="price-search"
        className={styles.input}
        type="text"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={texts.searchPlaceholder}
        value={query}
        onChange={(event) => onChange(event.target.value)}
      />
      {active && (
        <button type="button" className={styles.clear} aria-label={texts.clear} onClick={() => onChange("")} />
      )}
      </div>
      <div className={styles.meta}>
        <ul className={styles.chips}>
          {texts.popular.map((word) => (
            <li key={word}>
              <button
                type="button"
                className={cx(styles.chip, query.trim() === word && styles.chipOn)}
                aria-pressed={query.trim() === word}
                onClick={() => onChange(query.trim() === word ? "" : word)}
              >
                {word}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
