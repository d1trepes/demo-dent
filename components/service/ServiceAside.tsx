import { ButtonLink } from "@/components/ui/Button";
import { formatNumber } from "@/lib/format";
import type { ServiceDetails, ServicePageTexts } from "@/lib/types";
import styles from "./ServiceAside.module.css";

type Props = { service: ServiceDetails; texts: ServicePageTexts };

const ANCHORS = ["for", "price", "steps", "doctors"] as const;

/** Липкая плашка: цена направления, запись и якоря разделов. Признак «от» — у позиции с минимальной ценой (как в lib/servicesIndex.ts). */
export function ServiceAside({ service, texts }: Props) {
  const { direction, page, items } = service;
  const minItem = items.find((i) => i.directionId === direction.id && i.price === direction.priceFrom);
  const isFrom = minItem?.priceIsFrom ?? true;

  return (
    <aside className={styles.aside} aria-label={texts.asideLabel}>
      <div className={styles.buy}>
        <span className={styles.label}>{page.priceLabel}</span>
        <span className={styles.price}>
          {isFrom && <small>{texts.from}</small>}
          {formatNumber(direction.priceFrom)} ₽
        </span>
        {page.buyNote && <p className={styles.note}>{page.buyNote}</p>}
      </div>

      <ButtonLink href={`/zapis/?service=${direction.id}`} block>
        {texts.book}
      </ButtonLink>

      <nav className={styles.toc} aria-label={texts.tocLabel}>
        {ANCHORS.map((id) => (
          <a key={id} href={`#${id}`} className={styles.link}>
            {texts.toc[id]}
          </a>
        ))}
      </nav>
    </aside>
  );
}
