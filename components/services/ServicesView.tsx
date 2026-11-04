"use client";

import { useMemo, useState } from "react";
import { matchesItem, queryStems } from "@/lib/priceSearch";
import type { ServicesIndexCardView, ServicesIndexContent } from "@/lib/types";
import { ServiceCard } from "./ServiceCard";
import { ServicesAside } from "./ServicesAside";
import { ServicesUrgent } from "./ServicesUrgent";
import styles from "./ServicesView.module.css";

type Props = {
  texts: Omit<ServicesIndexContent, "cards">;
  cards: ServicesIndexCardView[];
  branches: { id: string; name: string }[];
  phone: { text: string; href: string };
};

export function ServicesView({ texts, cards, branches, phone }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const stems = useMemo(() => queryStems(query), [query]);
  // Поиск по названию, описанию и синонимам; счётчики разделов учитывают поиск
  const found = useMemo(
    () => cards.filter((c) => matchesItem({ title: `${c.name} ${c.short}`, synonyms: c.words }, stems)),
    [cards, stems],
  );
  const counts = useMemo(
    () =>
      Object.fromEntries(
        texts.categories.map((c) => [c.id, c.id === "all" ? found.length : found.filter((f) => f.category === c.id).length]),
      ),
    [texts.categories, found],
  );
  const shown = found.filter((c) => category === "all" || c.category === category);
  const filtered = category !== "all" || stems.length > 0;

  const [emptyBefore, emptyAfter] = texts.empty.text.split("{phone}");
  const cardTexts = { from: texts.from, more: texts.more };

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.head}>
          <h1 className={styles.title}>{texts.title}</h1>
          <p className={styles.lead}>{texts.lead}</p>
        </header>

        <div className={styles.layout}>
          <ServicesAside
            texts={texts}
            query={query}
            category={category}
            counts={counts}
            onQuery={setQuery}
            onCategory={setCategory}
          />

          <div className={styles.grid}>
            {shown.map((card) => (
              <ServiceCard key={card.directionId} card={card} wide={card.wide && !filtered} texts={cardTexts} />
            ))}
            {shown.length === 0 && (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>{texts.empty.title}</p>
                <p className={styles.emptyText}>
                  {emptyBefore}
                  <a href={phone.href} className={styles.phone}>
                    {phone.text}
                  </a>
                  {emptyAfter}
                </p>
              </div>
            )}
            {!filtered && <ServicesUrgent className={styles.urgent} texts={texts.urgent} branches={branches} />}
          </div>
        </div>
      </div>
    </div>
  );
}
