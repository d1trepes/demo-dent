import { formatCount, formatDate } from "@/lib/format";
import type { BranchesPageContent, ReviewsData } from "@/lib/types";
import styles from "./BranchReviews.module.css";

type Props = { data: ReviewsData; texts: BranchesPageContent["reviews"] };

const ratingFormatter = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1 });

/** Рейтинги площадок и 6 коротких отзывов про сервис, у каждого — площадка-источник. */
export function BranchReviews({ data, texts }: Props) {
  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.head}>
        <h2 id="reviews-title" className={styles.title}>
          {texts.title}
        </h2>
        <p className={styles.lead}>{texts.lead}</p>
      </div>

      <ul className={styles.ratings}>
        {data.ratings.map((r) => (
          <li key={r.source}>
            <a className={styles.rating} href={r.url} target="_blank" rel="noopener">
              <span className={styles.source}>{r.source}</span>
              <span className={styles.score}>
                {ratingFormatter.format(r.rating)} <small>{texts.ratingOf}</small>
              </span>
              <span className={styles.count}>{formatCount(r.count, texts.countForms)}</span>
            </a>
          </li>
        ))}
      </ul>

      <ul className={styles.reviews}>
        {data.reviews.map((r) => (
          <li key={r.id} className={styles.review}>
            <p className={styles.text}>{r.text}</p>
            <p className={styles.meta}>
              <span className={styles.author}>{r.author}</span>
              <span>
                {r.source} · {formatDate(r.date)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
