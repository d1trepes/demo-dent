import { asset } from "@/lib/asset";
import type { ServiceDetails, ServicePageTexts } from "@/lib/types";
import styles from "./ServiceIntro.module.css";

type Props = { service: ServiceDetails; texts: ServicePageTexts };

/** «Кому подходит»: фото направления, список и срок лечения. */
export function ServiceIntro({ service, texts }: Props) {
  const { page } = service;

  return (
    <section id="for" className={styles.card} aria-labelledby="for-title">
      <div className={styles.photo}>
        <img src={asset(`/images/directions/${page.slug}.webp`)} width={800} height={800} alt="" loading="lazy" decoding="async" />
      </div>

      <div className={styles.body}>
        <div>
          <h2 id="for-title" className={styles.title}>
            {texts.forTitle}
          </h2>
          <ul className={styles.list}>
            {page.forWhom.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <dl className={styles.fact}>
          <dt>{texts.durationLabel}</dt>
          <dd>{page.duration}</dd>
        </dl>
      </div>
    </section>
  );
}
