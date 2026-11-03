import Link from "next/link";
import type { HomeLink } from "@/lib/types";
import styles from "./HeroMarquee.module.css";

type Props = { label: string; items: HomeLink[] };

/**
 * Бегущая строка услуг внизу hero: две одинаковые ленты едут влево (CSS, бесшовно).
 * Пауза при наведении и фокусе, при prefers-reduced-motion стоит. Вторая лента скрыта от скринридера и Tab.
 * Фото-«таблетки» пока — серые заглушки.
 */
export function HeroMarquee({ label, items }: Props) {
  const track = (copy: boolean) => (
    <ul className={styles.track} aria-label={copy ? undefined : label} aria-hidden={copy || undefined}>
      {items.map((item) => (
        <li key={item.href} className={styles.item}>
          <Link href={item.href} className={styles.link} tabIndex={copy ? -1 : undefined}>
            {item.label}
          </Link>
          <span className={styles.pill} aria-hidden />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.marquee}>
      <div className={styles.inner}>
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
