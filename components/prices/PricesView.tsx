"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Contraindications } from "@/components/ui/Contraindications";
import { fill } from "@/lib/format";
import { matchesItem, queryStems } from "@/lib/priceSearch";
import type { Direction, PriceItem, PricesContent } from "@/lib/types";
import { PriceGroup, priceSectionId } from "./PriceGroup";
import { PriceSearch } from "./PriceSearch";
import { PriceAside } from "./PriceAside";
import styles from "./PricesView.module.css";

type Props = {
  directions: Direction[];
  items: PriceItem[];
  texts: PricesContent;
  phone: { text: string; href: string };
};

export function PricesView({ directions, items, texts, phone }: Props) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchOut, setSearchOut] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);

  // Основной поиск ушёл под шапку — показываем компактный в боковой колонке
  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setSearchOut(!entry.isIntersecting), {
      rootMargin: "-120px 0px 0px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stems = useMemo(() => queryStems(query), [query]);
  const groups = useMemo(
    () =>
      directions.map((direction) => ({
        direction,
        items: items.filter((item) => item.directionId === direction.id && matchesItem(item, stems)),
      })),
    [directions, items, stems],
  );
  const found = groups.reduce((sum, g) => sum + g.items.length, 0);

  const changeQuery = (value: string) => {
    setQuery(value);
    setOpenId(null);
  };
  // Поиск из боковой колонки: выдача меняется — возвращаем к её началу, если ушли ниже
  const changeFromAside = (value: string) => {
    changeQuery(value);
    const top = groupsRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) groupsRef.current?.scrollIntoView({ block: "start" });
  };
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  const [emptyBefore, emptyAfter] = texts.empty.text.split("{phone}");

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>{texts.title}</h1>
          <p className={styles.lead}>{texts.lead}</p>
        </div>
        <p className={styles.updated}>{texts.updated}</p>
      </header>

      <div className={styles.layout}>
        <PriceAside
          entries={groups.map((g) => ({ id: g.direction.id, title: g.direction.title, count: g.items.length }))}
          query={query}
          showSearch={searchOut}
          texts={texts}
          onChange={changeFromAside}
        />
        <div className={styles.main}>
          <div ref={searchRef}>
            <PriceSearch query={query} found={found} texts={texts} onChange={changeQuery} />
          </div>

          {found === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{fill(texts.empty.title, { q: query.trim() })}</p>
              <p className={styles.emptyText}>
                {emptyBefore}
                <a href={phone.href} className={styles.phone}>
                  {phone.text}
                </a>
                {emptyAfter}
              </p>
            </div>
          ) : (
            <div ref={groupsRef} className={styles.groups}>
              {groups
                .filter((g) => g.items.length > 0)
                .map((g) => (
                  <PriceGroup
                    key={priceSectionId(g.direction.id)}
                    direction={g.direction}
                    items={g.items}
                    stems={stems}
                    openId={openId}
                    onToggle={toggle}
                    texts={texts}
                  />
                ))}
            </div>
          )}

          <div className={styles.legal}>
            <Contraindications />
          </div>
        </div>
      </div>
    </div>
  );
}
