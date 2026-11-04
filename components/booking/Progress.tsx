import { Check } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./Wizard.module.css";

export type ProgressItem = { id: number; label: string; state: "done" | "current" | "todo" };

type Props = { label: string; items: ProgressItem[]; onSelect: (id: number) => void };

/** Прогресс сверху: пройденные шаги — кнопки (можно вернуться), текущий — aria-current. */
export function Progress({ label, items, onSelect }: Props) {
  return (
    <nav aria-label={label}>
      <ol className={styles.progress}>
        {items.map((item, index) => {
          const body = (
            <>
              <span className={styles.progressMark}>{item.state === "done" ? <Check size={16} aria-hidden /> : index + 1}</span>
              <span className={styles.progressLabel}>{item.label}</span>
            </>
          );
          return (
            <li key={item.id} className={cx(styles.progressItem, styles[item.state])}>
              {item.state === "done" ? (
                <button type="button" className={styles.progressButton} onClick={() => onSelect(item.id)}>
                  {body}
                </button>
              ) : (
                <span className={styles.progressButton} aria-current={item.state === "current" ? "step" : undefined}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
