import Link from "next/link";
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

export function priceSectionId(directionId: string) {
  return `dir-${directionId}`;
}

export function PriceGroup({ direction, items, stems, openId, onToggle, texts }: Props) {
  return (
    <section id={priceSectionId(direction.id)} className={styles.group} aria-labelledby={`${priceSectionId(direction.id)}-title`}>
      <header className={styles.head}>
        <h2 id={`${priceSectionId(direction.id)}-title`} className={styles.title}>
          {direction.title}
        </h2>
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
