"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cx } from "@/lib/cx";
import { priceSectionId } from "./PriceGroup";
import styles from "./PriceToc.module.css";

export type TocEntry = { id: string; title: string; count: number };

type Props = { entries: TocEntry[]; label: string };

export function PriceToc({ entries, label }: Props) {
  const [observed, setObserved] = useState<string | null>(null);
  const available = entries.filter((e) => e.count > 0);
  const availableKey = available.map((e) => e.id).join("|");
  // Пока наблюдатель не сработал (или раздел исчез из выдачи) — активен первый доступный
  const activeId = observed && available.some((e) => e.id === observed) ? observed : available[0]?.id;

  useEffect(() => {
    const ids = availableKey ? availableKey.split("|") : [];
    const sections = ids.map((id) => document.getElementById(priceSectionId(id))).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const id = record.target.id.replace(/^dir-/, "");
          if (record.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const first = ids.find((id) => visible.has(id));
        if (first) setObserved(first);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [availableKey]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(priceSectionId(id));
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setObserved(id);
  };

  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {entries.map((entry) => {
          const disabled = entry.count === 0;
          return (
            <li key={entry.id}>
              <a
                href={`#${priceSectionId(entry.id)}`}
                className={cx(styles.link, entry.id === activeId && styles.active, disabled && styles.disabled)}
                aria-current={entry.id === activeId ? "true" : undefined}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
                onClick={(event) => (disabled ? event.preventDefault() : go(event, entry.id))}
              >
                <span>{entry.title}</span>
                <span className={styles.count}>{entry.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
