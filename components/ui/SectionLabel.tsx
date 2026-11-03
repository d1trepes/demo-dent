import { cx } from "@/lib/cx";
import styles from "./SectionLabel.module.css";

type Props = {
  /** Номер секции на главной: 1 → «(01)». */
  index?: number;
  children: string;
  tone?: "default" | "light";
  className?: string;
};

/** Мелкая подпись над заголовком секции: «(04) Врачи». */
export function SectionLabel({ index, children, tone = "default", className }: Props) {
  return (
    <p className={cx(styles.label, tone === "light" && styles.light, className)}>
      {index !== undefined && <span className={styles.index}>({String(index).padStart(2, "0")})</span>}
      {children}
    </p>
  );
}
