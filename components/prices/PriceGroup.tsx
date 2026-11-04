import Link from "next/link";
import { fill } from "@/lib/format";
import { pluralWord } from "@/lib/priceSearch";
import type { Direction, PriceItem, PricesContent } from "@/lib/types";
import { PriceRow } from "./PriceRow";
import styles from "./PriceGroup.module.css";

type Props = {
  direction: Direction;
  items: PriceItem[];
  stems: string[];
  openId: string | null;
  onToggle: (id: string) => void;
  texts: PricesContent;
};

export function PriceGroup({ direction, items, stems, openId, onToggle, texts }: Props) {
  return (
    <section className={styles.group} aria-labelledby={`price-${direction.id}-title`}>
      <header className={styles.head}>
        <div className={styles.titleWrap}>
          <h2 id={`price-${direction.id}-title`} className={styles.title}>
            {direction.title}
          </h2>
          <span className={styles.count}>{fill(texts.count, { n: items.length, word: pluralWord(items.length, texts.serviceForms) })}</span>
        </div>
        {direction.hasPage && (
          <Link href={`/uslugi/${direction.id}/`} className={styles.about}>
            {texts.aboutDirection}
          </Link>
        )}
      </header>
      <ul className={styles.list}>
        {items.map((item) => (
          <PriceRow key={item.id} item={item} stems={stems} open={openId === item.id} onToggle={onToggle} texts={texts} />
        ))}
      </ul>
    </section>
  );
}
