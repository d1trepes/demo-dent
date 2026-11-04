import { RevealTitle } from "@/components/ui/RevealTitle";
import Link from "next/link";
import { getHomeContent, getServices } from "@/lib/api";
import { asset } from "@/lib/asset";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { UrgentCallout } from "@/components/ui/UrgentCallout";
import styles from "./Directions.module.css";

/**
 * Блок 2 главной — «Направления»: лёгкий прайс строками (docs/DESIGN.md, «Блок 2»).
 * Порядок и описания — data/home.json, цены — только priceFrom из services.json.
 */
export async function Directions() {
  const [{ directions: content }, { directions }] = await Promise.all([getHomeContent(), getServices()]);

  const rows = content.rows.flatMap((row) => {
    const direction = directions.find((d) => d.id === row.directionId && d.hasPage);
    return direction ? [{ ...row, title: direction.title, priceFrom: direction.priceFrom }] : [];
  });

  return (
    <section className={styles.section} aria-labelledby="directions-title">
      <div className={`container ${styles.layout}`}>
        <RevealTitle id="directions-title" text={content.title} className={styles.title} />
        <ButtonLink href={content.allPrices.href} variant="secondary" className={styles.all}>
          {content.allPrices.label}
        </ButtonLink>

        <ol className={styles.list}>
          {rows.map((row, i) => (
            <li key={row.directionId}>
              <Link href={`/uslugi/${row.directionId}/`} className={styles.row}>
                <span className={styles.num} aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.name}>{row.title}</span>
                <span className={styles.desc}>{row.description}</span>
                <span className={styles.pillSlot} aria-hidden>
                  <span className={styles.pill}>
                    <img
                      src={asset(row.photo.src)}
                      width={row.photo.width}
                      height={row.photo.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </span>
                <span className={styles.price}>
                  <span className={styles.priceValue}>{formatPrice(row.priceFrom, true)}</span>
                  {row.priceNote && <span className={styles.priceNote}>{row.priceNote}</span>}
                </span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ol>

        <UrgentCallout
          className={styles.urgent}
          title={content.urgent.label}
          text={content.urgent.text}
          action={content.urgent.action}
          href={content.urgent.href}
        />
      </div>
    </section>
  );
}

/** Короткая линия-стрелка, появляется при наведении и фокусе. */
function Arrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 32 12" width="32" height="12" aria-hidden>
      <path d="M0 6 H30 M25 1 L30 6 L25 11" />
    </svg>
  );
}
