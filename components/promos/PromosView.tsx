import { CallbackCard } from "@/components/home/CallbackCard";
import type { HomeCallback, Promo, PromosContent } from "@/lib/types";
import { PromoCard } from "./PromoCard";
import styles from "./PromosView.module.css";

type Props = { content: PromosContent; promos: Promo[]; callback: HomeCallback };

/**
 * /akcii/: первая акция широкой карточкой, остальные по две в ряд → «Перезвоните мне».
 * Предупреждение о противопоказаниях — только в подвале (docs/DESIGN.md).
 */
export function PromosView({ content, promos, callback }: Props) {
  const texts = { until: content.until, termsLabel: content.termsLabel, book: content.book, about: content.about };
  return (
    <div className={styles.page}>
      <div className="container">
        <header>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.lead}>{content.lead}</p>
        </header>

        <section className={styles.list} aria-label={content.title}>
          <div className={styles.grid}>
            {promos.map((promo, i) => (
              <PromoCard key={promo.id} promo={promo} wide={i === 0} texts={texts} />
            ))}
          </div>
        </section>

        <section id="callback" className={styles.callback} aria-labelledby="callback-title">
          <CallbackCard
            content={{ ...callback, title: content.callback.title, subtitle: content.callback.subtitle }}
            titleId="callback-title"
            source={{ page: "/akcii/", label: content.callback.sourceLabel }}
          />
        </section>
      </div>
    </div>
  );
}
