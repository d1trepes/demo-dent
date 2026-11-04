import { cx } from "@/lib/cx";
import type { PricesContent } from "@/lib/types";
import { PriceToc, type TocEntry } from "./PriceToc";
import styles from "./PriceAside.module.css";

type Props = {
  entries: TocEntry[];
  query: string;
  showSearch: boolean;
  texts: PricesContent;
  onChange: (value: string) => void;
};

/** Липкая колонка: компактный поиск (появляется, когда основной ушёл из вида) + оглавление. */
export function PriceAside({ entries, query, showSearch, texts, onChange }: Props) {
  return (
    <aside className={styles.aside}>
      <div className={cx(styles.searchWrap, showSearch && styles.searchShown)} aria-hidden={!showSearch}>
        <div className={styles.searchClip}>
          <div className={styles.search}>
            <label className="visually-hidden" htmlFor="price-search-aside">
              {texts.searchLabel}
            </label>
            <input
              id="price-search-aside"
              className={styles.input}
              type="text"
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              placeholder={texts.searchShort}
              value={query}
              tabIndex={showSearch ? 0 : -1}
              onChange={(event) => onChange(event.target.value)}
            />
            {query && (
              <button
                type="button"
                className={styles.clear}
                aria-label={texts.clear}
                tabIndex={showSearch ? 0 : -1}
                onClick={() => onChange("")}
              />
            )}
          </div>
        </div>
      </div>
      <PriceToc label={texts.tocLabel} entries={entries} />
    </aside>
  );
}
