import { ButtonLink } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { fill, formatPrice } from "@/lib/format";
import { highlightTitle } from "@/lib/priceSearch";
import type { PriceItem, PricesContent } from "@/lib/types";
import styles from "./PriceRow.module.css";

type Props = {
  item: PriceItem;
  stems: string[];
  open: boolean;
  onToggle: (id: string) => void;
  texts: PricesContent;
};

/** Длительность от этого значения — несколько визитов. */
const MULTI_VISIT_MIN = 150;

export function PriceRow({ item, stems, open, onToggle, texts }: Props) {
  const panelId = `price-panel-${item.id}`;
  const { facts } = texts;
  const facts3 = [
    {
      label: facts.duration,
      value: item.durationMin >= MULTI_VISIT_MIN ? facts.multi : fill(facts.minutes, { n: item.durationMin }),
    },
    { label: facts.code, value: item.code },
    { label: facts.price, value: item.priceIsFrom ? facts.perTooth : facts.fixed },
  ];

  return (
    <li className={styles.item}>
      <button
        type="button"
        className={cx(styles.row, open && styles.rowOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(item.id)}
      >
        <span className={styles.name}>
          {highlightTitle(item.title, stems).map((part, i) =>
            part.hit ? <mark key={i} className={styles.mark}>{part.text}</mark> : part.text,
          )}
        </span>
        <span className={styles.leader} aria-hidden="true" />
        <span className={styles.price}>{item.price === 0 ? texts.free : formatPrice(item.price, item.priceIsFrom)}</span>
      </button>
      <div id={panelId} className={cx(styles.panel, open && styles.panelOpen)}>
        <div className={styles.panelClip}>
          <div className={styles.details}>
            <dl className={styles.facts}>
              {facts3.map((f) => (
                <div key={f.label} className={styles.fact}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href={`/zapis/?service=${item.id}`} variant="secondary" tabIndex={open ? 0 : -1}>
              {texts.book}
            </ButtonLink>
          </div>
        </div>
      </div>
    </li>
  );
}
