import { fill } from "@/lib/format";
import { pluralWord } from "@/lib/priceSearch";
import type { PricesContent } from "@/lib/types";
import styles from "./PriceSearch.module.css";

type Props = {
  query: string;
  found: number;
  texts: PricesContent;
  onChange: (value: string) => void;
};

export function PriceSearch({ query, found, texts, onChange }: Props) {
  const active = query.trim().length > 0;
  return (
    <div className={styles.search}>
      <label className="visually-hidden" htmlFor="price-search">
        {texts.searchLabel}
      </label>
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
      <div className={styles.meta}>
        <ul className={styles.chips}>
          {texts.popular.map((word) => (
            <li key={word}>
              <button type="button" className={styles.chip} onClick={() => onChange(word)}>
                {word}
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.found} aria-live="polite">
          {active && (
            <>
              {fill(texts.found, { n: found, word: pluralWord(found, texts.serviceForms) })}
              {" · "}
              <button type="button" className={styles.reset} onClick={() => onChange("")}>
                {texts.reset}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
