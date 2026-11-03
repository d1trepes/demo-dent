import { Star, Zap } from "lucide-react";
import { getBranches, getHomeContent, getReviews } from "@/lib/api";
import { asset } from "@/lib/asset";
import { bookingHref } from "@/lib/nav";
import { ButtonLink } from "@/components/ui/Button";
import { Contraindications } from "@/components/ui/Contraindications";
import { NearestSlots } from "./NearestSlots";
import styles from "./Hero.module.css";

/** Блок 1 главной: огромное слово-марка за фото врача, синяя плашка с записью и ближайшим временем. */
export async function Hero() {
  const [{ hero }, branches, reviews] = await Promise.all([getHomeContent(), getBranches(), getReviews()]);
  const top = [...reviews.ratings].sort((a, b) => b.count - a.count)[0];

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <ul className={styles.eyebrow}>
          {hero.eyebrow.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className={styles.stage}>
          <p className={styles.mark} aria-hidden>
            {hero.mark}
          </p>

          <div className={styles.panel}>
            <img
              className={styles.photo}
              src={asset(hero.photo.src)}
              width={hero.photo.width}
              height={hero.photo.height}
              alt={hero.photo.alt}
              fetchPriority="high"
              decoding="async"
            />

            <div className={styles.copy}>
              <h1 id="hero-title" className={styles.title}>
                {hero.title} <em>{hero.titleAccent}</em>
              </h1>
              <p className={styles.lead}>{hero.lead}</p>
              <div className={styles.actions}>
                <ButtonLink href={bookingHref} variant="light" size="lg" arrow>
                  Записаться
                </ButtonLink>
                <ButtonLink
                  href="/zapis/?mode=urgent"
                  variant="outlineLight"
                  size="lg"
                  icon={<Zap aria-hidden size={18} />}
                >
                  Острая боль — приём сегодня
                </ButtonLink>
              </div>
            </div>

            <div className={styles.aside}>
              <NearestSlots title={hero.slotsTitle} branches={branches.map(({ id, name }) => ({ id, name }))} />
              <a href={top.url} className={styles.rating} target="_blank" rel="noopener noreferrer">
                <span className={styles.score}>{top.rating.toFixed(1).replace(".", ",")}</span>
                <span className={styles.ratingText}>
                  <span className={styles.stars} aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </span>
                  <span>
                    {top.source} · {top.count} отзывов
                  </span>
                </span>
              </a>
            </div>

            <Contraindications variant="banner" tone="onBlue" className={styles.note} />
          </div>
        </div>
      </div>
    </section>
  );
}
