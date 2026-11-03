import { getHomeContent } from "@/lib/api";
import { asset } from "@/lib/asset";
import { ButtonLink } from "@/components/ui/Button";
import { Contraindications } from "@/components/ui/Contraindications";
import { HeroMarquee } from "./HeroMarquee";
import styles from "./Hero.module.css";

/**
 * Блок 1 главной, вариант C «Арка по центру» (docs/DESIGN.md).
 * Заголовок разорван аркой; врач — вырезанная фигура, голова выходит за арку, рукава заходят на буквы.
 * Видимые слова заголовка — декоративные (aria-hidden), для скринридера — цельный h1.
 */
export async function Hero() {
  const { hero } = await getHomeContent();
  const { title } = hero;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="visually-hidden">
        {`${title.left} ${title.rightLead} ${title.rightAccent}`}
      </h1>

      <div className="container">
        <div className={styles.stage}>
          <p className={styles.wordLeft} aria-hidden>
            {title.left}
          </p>

          <div className={styles.arch}>
            <span className={styles.archLine} aria-hidden />
            <span className={styles.archFill} aria-hidden />
            <img
              className={styles.photo}
              src={asset(hero.photo.src)}
              width={hero.photo.width}
              height={hero.photo.height}
              alt={hero.photo.alt}
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <p className={styles.wordRight} aria-hidden>
            {title.rightLead} <em>{title.rightAccent}</em>
          </p>

          <p className={styles.lead}>{hero.lead}</p>

          <div className={styles.cta}>
            <ButtonLink href={hero.cta.href}>{hero.cta.label}</ButtonLink>
          </div>

          <span className={styles.spark} aria-hidden>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12 6.4-.6 11.4-5.6 12-12Z" />
            </svg>
          </span>
        </div>
      </div>

      <HeroMarquee label={hero.marqueeLabel} items={hero.marquee} />

      <div className="container">
        <Contraindications className={styles.note} />
      </div>
    </section>
  );
}
