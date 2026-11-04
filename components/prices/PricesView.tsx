"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fill } from "@/lib/format";
import { matchesItem, queryStems } from "@/lib/priceSearch";
import type { Direction, PriceItem, PricesContent } from "@/lib/types";
import { PriceGroup } from "./PriceGroup";
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
  const [direction, setDirection] = useState("all");
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

  // /ceny/?direction=<id> — со страницы услуги открываем прайс с выбранным направлением
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("direction");
    if (id && directions.some((d) => d.id === id)) setDirection(id);
  }, [directions]);

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
  // Направление, пустое в поисковой выдаче, не держим выбранным
  const active = direction !== "all" && groups.some((g) => g.direction.id === direction && g.items.length > 0) ? direction : "all";
  const shown = groups.filter((g) => g.items.length > 0 && (active === "all" || g.direction.id === active));
  const entries = [
    { id: "all", title: texts.all, count: found },
    ...groups.map((g) => ({ id: g.direction.id, title: g.direction.title, count: g.items.length })),
  ];

  const changeQuery = (value: string) => {
    setQuery(value);
    setOpenId(null);
  };
  // Выдача из боковой колонки меняется — возвращаем к её началу, если ушли ниже
  const toListTop = () => {
    const top = groupsRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) groupsRef.current?.scrollIntoView({ block: "start" });
  };
  const changeFromAside = (value: string) => {
    changeQuery(value);
    toListTop();
  };
  const changeDirection = (id: string) => {
    setDirection(id);
    setOpenId(null);
    toListTop();
  };
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  const [emptyBefore, emptyAfter] = texts.empty.text.split("{phone}");

  return (
    <div className={styles.page}>
      <div className="container">
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>{texts.title}</h1>
          <p className={styles.lead}>{texts.lead}</p>
        </div>
      </header>

      <div className={styles.layout}>
        <PriceAside
          entries={entries}
          direction={active}
          query={query}
          showSearch={searchOut}
          texts={texts}
          onChange={changeFromAside}
          onDirection={changeDirection}
        />
        <div className={styles.main}>
          <div ref={searchRef}>
            <PriceSearch query={query} texts={texts} onChange={changeQuery} />
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
              {shown.map((g) => (
                <PriceGroup
                  key={g.direction.id}
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

        </div>
      </div>
      </div>
    </div>
  );
}
