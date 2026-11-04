import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./UrgentCallout.module.css";

type Props = {
  title: string;
  text: ReactNode;
  action: string;
  /** Ссылка (главная) или действие (мастер записи). */
  href?: string;
  onAction?: () => void;
  /** Компактный вид — внутри карточки мастера. */
  compact?: boolean;
  /** Широкая плашка на всю ширину страницы (/uslugi/): крупнее отступы и заголовок. */
  wide?: boolean;
  className?: string;
};

/** Синяя плашка «Болит зуб? Приём сегодня»: нажимается только белая кнопка (правка 2E). */
export function UrgentCallout({ title, text, action, href, onAction, compact, wide, className }: Props) {
  return (
    <div className={cx(styles.urgent, compact && styles.compact, wide && styles.wide, className)}>
      <p className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.note}>{text}</span>
      </p>
      {href ? (
        <Link href={href} className={styles.action}>
          {action}
        </Link>
      ) : (
        <button type="button" className={styles.action} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
