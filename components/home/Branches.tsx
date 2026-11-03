import Link from "next/link";
import { getBranches, getHomeContent, getReviews } from "@/lib/api";
import { asset } from "@/lib/asset";
import { formatCount } from "@/lib/format";
import type { Picture } from "@/lib/types";
import styles from "./Branches.module.css";

const ratingFormatter = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Photo({ picture, className }: { picture: Picture; className: string }) {
  return (
    <div className={className}>
      <img src={asset(picture.src)} width={picture.width} height={picture.height} alt={picture.alt} loading="lazy" decoding="async" />
    </div>
  );
}

/**
 * Блок 7 главной — «Филиалы» (реф. ref-branches-rows.png): слева заголовок, абзац, рейтинги и 2 доп. фото,
 * справа 2 карточки-строки филиалов. Адреса, часы, отзывы и рейтинги — branches.json и reviews.json через lib/api.ts,
 * тексты и фото — data/home.json → branchesBlock. Без синей заливки и листьев.
 */
export async function Branches() {
  const [{ branchesBlock: content }, branches, { ratings, reviews }] = await Promise.all([
    getHomeContent(),
    getBranches(),
    getReviews(),
  ]);

  const [first] = branches;
  const intro = content.intro
    .replace("{weekdays}", first?.hours.weekdays ?? "")
    .replace("{weekend}", first?.hours.weekend ?? "")
    .replace("{kidsBranch}", branches.find((b) => b.hasKidsRoom)?.name ?? "")
    .replace("{ctBranch}", branches.find((b) => b.hasCT)?.name ?? "");

  return (
    <section className={styles.section} aria-labelledby="branches-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <h2 id="branches-title" className={styles.title}>
            {content.title}
          </h2>
          <p className={styles.intro}>{intro}</p>
          <div className={styles.ratings}>
            <p className="visually-hidden">{content.ratingsLabel}</p>
            <ul className={styles.ratingList}>
              {ratings.map((r) => (
                <li key={r.source} className={styles.rating}>
                  <span className={styles.ratingValue}>{ratingFormatter.format(r.rating)}</span>
                  <span className={styles.ratingSource}>
                    {r.source}
                    <span className={styles.ratingCount}>{formatCount(r.count, content.reviewsWord)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className={styles.cards}>
          {content.cards.map((card) => {
            const branch = branches.find((b) => b.id === card.branchId);
            if (!branch) return null;
            const review = reviews.find((r) => r.id === card.reviewId);
            const features = [branch.hasCT && content.features.ct, branch.hasKidsRoom && content.features.kids].filter(
              (f): f is string => Boolean(f),
            );
            return (
              <li key={branch.id} className={styles.card}>
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>«{branch.name}»</h3>
                  <p className={styles.address}>{branch.address}</p>
                  <p className={styles.hours}>
                    <span>{branch.hours.weekdays}</span>
                    <span>{branch.hours.weekend}</span>
                  </p>
                  {features.length > 0 && (
                    <ul className={styles.features}>
                      {features.map((f) => (
                        <li key={f} className={styles.feature}>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {review && (
                    <figure className={styles.review}>
                      <blockquote className={styles.reviewText}>«{review.text}»</blockquote>
                      <figcaption className={styles.reviewAuthor}>
                        {review.author}, {review.source}
                      </figcaption>
                    </figure>
                  )}
                  <Link href={content.routeLink.href} className={styles.route}>
                    {content.routeLink.label}
                  </Link>
                </div>
                <div className={styles.cardPhotos}>
                  {card.photos.map((p) => (
                    <Photo key={p.src} picture={p} className={styles.cardPhoto} />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.extras}>
          {content.extras.map((p) => (
            <Photo key={p.src} picture={p} className={styles.extra} />
          ))}
        </div>
      </div>
    </section>
  );
}
