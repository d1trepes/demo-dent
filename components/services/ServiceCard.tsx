import Link from "next/link";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import type { ServicesIndexCardView, ServicesIndexContent } from "@/lib/types";
import styles from "./ServiceCard.module.css";

type Props = {
  card: ServicesIndexCardView;
  /** Широкая карточка — только пока нет фильтра и поиска. */
  wide: boolean;
  texts: Pick<ServicesIndexContent, "from" | "more">;
};

/** Карточка направления: вся — ссылка на /uslugi/<id>/. Цена — из services.json. */
export function ServiceCard({ card, wide, texts }: Props) {
  const price = (
    <span className={styles.price}>
      {card.priceIsFrom && <small>{texts.from}</small>}
      {formatPrice(card.price)}
    </span>
  );
  return (
    <Link href={`/uslugi/${card.directionId}/`} className={cx(styles.card, wide && styles.wide)}>
      <div className={styles.photo}>
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.photoImg} src={asset(card.image)} alt="" width={1280} height={800} loading="lazy" />
        ) : (
          <div className={styles.photoImg}>
            <span className={styles.shot}>{card.shot}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <div>
          <h2 className={styles.name}>{card.name}</h2>
          <p className={styles.short}>{card.short}</p>
        </div>
        <div className={styles.foot}>
          {wide && card.priceLabel ? (
            <span>
              <span className={styles.priceLabel}>{card.priceLabel}</span>
              {price}
            </span>
          ) : (
            price
          )}
          <span className={styles.more}>{texts.more}</span>
        </div>
      </div>
    </Link>
  );
}
