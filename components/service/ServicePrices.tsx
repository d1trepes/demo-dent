import Link from "next/link";
import { fill, formatNumber } from "@/lib/format";
import { pluralWord } from "@/lib/priceSearch";
import type { PriceItem, ServiceDetails, ServicePageTexts } from "@/lib/types";
import styles from "./ServicePrices.module.css";

type Props = { service: ServiceDetails; texts: ServicePageTexts };

/** «Название: пояснение» → название и хвост; хвост уходит в подстроку вместе с длительностью. */
function splitTitle(title: string): { name: string; tail: string | null } {
  const at = title.indexOf(":");
  if (at < 0) return { name: title, tail: null };
  return { name: title.slice(0, at), tail: title.slice(at + 1).trim() };
}

function Row({ item, texts }: { item: PriceItem; texts: ServicePageTexts }) {
  const { name, tail } = splitTitle(item.title);
  const minutes = fill(texts.minutes, { n: item.durationMin });

  return (
    <li className={styles.item}>
      <Link href={`/zapis/?service=${item.id}`} className={styles.row}>
        <span className={styles.name}>
          {name}
          <span className={styles.sub}>{tail ? `${tail} · ${minutes}` : minutes}</span>
        </span>
        {item.price === 0 ? (
          <span className={styles.free}>{texts.free}</span>
        ) : (
          <span className={styles.price}>
            {item.priceIsFrom && <small>{texts.from}</small>}
            {formatNumber(item.price)} ₽
          </span>
        )}
      </Link>
    </li>
  );
}

/** «Цены»: позиции из page.priceItemIds, каждая — ссылка на запись; внизу примечание. */
export function ServicePrices({ service, texts }: Props) {
  const { page, items, direction } = service;

  return (
    <section id="price" className={styles.card} aria-labelledby="price-title">
      <div className={styles.head}>
        <div className={styles.headMain}>
          <h2 id="price-title" className={styles.title}>
            {texts.pricesTitle}
          </h2>
          <span className={styles.count}>{fill(texts.count, { n: items.length, word: pluralWord(items.length, texts.serviceForms) })}</span>
        </div>
        <Link href={`/ceny/?direction=${direction.id}`} className={styles.pill}>
          {texts.allPrices}
        </Link>
      </div>

      <ul className={styles.rows}>
        {items.map((item) => (
          <Row key={item.id} item={item} texts={texts} />
        ))}
      </ul>

      <p className={styles.priceNote}>{page.priceNote}</p>
    </section>
  );
}
