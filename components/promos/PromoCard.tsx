import { ButtonLink } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import { fill, formatDayMonth } from "@/lib/format";
import type { Promo, PromosContent } from "@/lib/types";
import styles from "./PromoCard.module.css";

type Props = {
  promo: Promo;
  wide: boolean;
  texts: Pick<PromosContent, "until" | "termsLabel" | "book" | "about">;
};

/** Карточка акции: фото направления, срок, цифра акции, условия видны сразу, запись в мастер с услугой. */
export function PromoCard({ promo, wide, texts }: Props) {
  const titleId = `promo-${promo.id}`;
  return (
    <article className={cx(styles.card, wide && styles.wide)} aria-labelledby={titleId}>
      <div className={styles.photo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.img} src={asset(promo.image)} alt="" width={800} height={800} loading="lazy" decoding="async" />
        <span className={styles.until}>{fill(texts.until, { date: formatDayMonth(promo.validUntil) })}</span>
      </div>

      <div className={styles.body}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {promo.title}
          </h2>
          <p className={styles.text}>{promo.text}</p>
          <div className={styles.terms}>
            <h3 className={styles.termsLabel}>{texts.termsLabel}</h3>
            <p className={styles.termsText}>{promo.conditions}</p>
          </div>
        </div>

        <div className={styles.foot}>
          <p className={styles.value}>
            <span className={styles.valueNum}>{promo.value}</span>
            <span className={styles.valueLabel}>{promo.valueLabel}</span>
          </p>
          <div className={styles.actions}>
            <ButtonLink href={`/zapis/?service=${promo.serviceId}`}>{texts.book}</ButtonLink>
            <ButtonLink href={`/uslugi/${promo.directionId}/`} variant="secondary">
              {texts.about}
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
