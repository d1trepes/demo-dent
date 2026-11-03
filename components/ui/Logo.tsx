import { cx } from "@/lib/cx";
import styles from "./Logo.module.css";

type Props = { name: string; tone?: "default" | "light"; className?: string };

/** Знак — перистый лист ясеня, слово — курсив антиквы. Цвет берётся из currentColor. */
export function Logo({ name, tone = "default", className }: Props) {
  return (
    <span className={cx(styles.logo, tone === "light" && styles.light, className)}>
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden focusable="false">
        <path d="M16 30V4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 4c-2.6 1.6-3.6 4-2.8 6.4 2.6-.6 3.6-3.4 2.8-6.4Z" fill="currentColor" />
        <path d="M16 4c2.6 1.6 3.6 4 2.8 6.4-2.6-.6-3.6-3.4-2.8-6.4Z" fill="currentColor" />
        <path d="M16 12.5c-4-.2-6.8 1.6-7.6 4.6 3.4.9 6.4-1 7.6-4.6Z" fill="currentColor" />
        <path d="M16 12.5c4-.2 6.8 1.6 7.6 4.6-3.4.9-6.4-1-7.6-4.6Z" fill="currentColor" />
        <path d="M16 19.5c-4-.2-6.8 1.6-7.6 4.6 3.4.9 6.4-1 7.6-4.6Z" fill="currentColor" />
        <path d="M16 19.5c4-.2 6.8 1.6 7.6 4.6-3.4.9-6.4-1-7.6-4.6Z" fill="currentColor" />
      </svg>
      <span className={styles.word}>{name}</span>
    </span>
  );
}
