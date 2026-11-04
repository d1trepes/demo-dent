import { cx } from "@/lib/cx";
import { fill } from "@/lib/format";
import styles from "./Wizard.module.css";

export type ProgressItem = { id: number; label: string; state: "done" | "current" | "todo" };

type Props = {
  label: string;
  stepOf: string;
  backTo: string;
  items: ProgressItem[];
  onSelect: (id: number) => void;
};

/** Прогресс: «Шаг 2 из 4 · Филиал и врач» + тонкая полоса; пройденные отрезки — кнопки «вернуться». */
export function Progress({ label, stepOf, backTo, items, onSelect }: Props) {
  const index = items.findIndex((i) => i.state === "current");
  const current = items[index];
  return (
    <nav aria-label={label} className={styles.progress}>
      <p className={styles.progressText} aria-live="polite">
        <span className={styles.progressCount}>{fill(stepOf, { n: String(index + 1), total: String(items.length) })}</span>
        {current && <span> · {current.label}</span>}
      </p>
      <ol className={styles.progressBar}>
        {items.map((item) => (
          <li key={item.id} className={cx(styles.progressItem, styles[item.state])}>
            {item.state === "done" ? (
              <button
                type="button"
                className={styles.progressHit}
                aria-label={fill(backTo, { label: item.label })}
                title={item.label}
                onClick={() => onSelect(item.id)}
              />
            ) : (
              <span className={styles.progressHit} aria-current={item.state === "current" ? "step" : undefined}>
                <span className="visually-hidden">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
