import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import styles from "./Logo.module.css";

type Props = { name: string; tone?: "default" | "light"; className?: string };

/** Знак — зуб с веточкой ясеня (public/logo.svg), слово — Prata. Цвет знака — currentColor через маску. */
export function Logo({ name, tone = "default", className }: Props) {
  const mark = { "--logo-src": `url(${asset("/logo.svg")})` } as CSSProperties;
  return (
    <span className={cx(styles.logo, tone === "light" && styles.light, className)}>
      <span className={styles.mark} style={mark} aria-hidden />
      <span className={styles.word}>{name}</span>
    </span>
  );
}
