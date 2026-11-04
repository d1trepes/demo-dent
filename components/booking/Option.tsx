import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Steps.module.css";

type Props = {
  selected: boolean;
  onClick: () => void;
  title: string;
  text?: string;
  meta?: string;
  lead?: ReactNode;
  disabled?: boolean;
  /** Строка поменьше — для необязательных уточнений. */
  compact?: boolean;
  className?: string;
};

/** Строка выбора: кнопка с aria-pressed, выбранная — в рамке кобальта на светлой плашке. */
export function Option({ selected, onClick, title, text, meta, lead, disabled, compact, className }: Props) {
  return (
    <button
      type="button"
      className={cx(styles.option, compact && styles.compact, selected && styles.selected, className)}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {lead}
      <span className={styles.optionMain}>
        <span className={styles.optionTitle}>{title}</span>
        {text && <span className={styles.optionText}>{text}</span>}
      </span>
      {meta && <span className={styles.optionMeta}>{meta}</span>}
      {selected && <Check className={styles.check} size={20} aria-hidden />}
    </button>
  );
}
