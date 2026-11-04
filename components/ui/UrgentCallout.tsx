import Link from "next/link";
import { cx } from "@/lib/cx";
import styles from "./UrgentCallout.module.css";

type Props = {
  title: string;
  text: string;
  action: string;
  /** Ссылка (главная) или действие (мастер записи). */
  href?: string;
  onAction?: () => void;
  /** Компактный вид — внутри карточки мастера. */
  compact?: boolean;
  className?: string;
};

/** Синяя плашка «Болит зуб? Приём сегодня»: нажимается только белая кнопка (правка 2E). */
export function UrgentCallout({ title, text, action, href, onAction, compact, className }: Props) {
  return (
    <div className={cx(styles.urgent, compact && styles.compact, className)}>
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
