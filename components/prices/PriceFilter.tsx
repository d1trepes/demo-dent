import styles from "./PriceFilter.module.css";

export type FilterEntry = { id: string; title: string; count: number };

type Props = {
  entries: FilterEntry[];
  active: string;
  label: string;
  onSelect: (id: string) => void;
};

/** Кнопки-направления: «Все направления» первой, счётчики — по поисковой выдаче. */
export function PriceFilter({ entries, active, label, onSelect }: Props) {
  return (
    <div className={styles.list} role="group" aria-label={label}>
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={styles.item}
          aria-pressed={entry.id === active}
          disabled={entry.count === 0}
          onClick={() => onSelect(entry.id)}
        >
          <span>{entry.title}</span>
          <span className={styles.count}>{entry.count}</span>
        </button>
      ))}
    </div>
  );
}
