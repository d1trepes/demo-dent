import { CallbackCard } from "@/components/home/CallbackCard";
import { PageHead } from "@/components/ui/PageHead";
import type { Branch, BranchesPageContent, HomeCallback, ReviewsData } from "@/lib/types";
import { BranchCard } from "./BranchCard";
import { BranchReviews } from "./BranchReviews";
import styles from "./BranchesView.module.css";

type Props = { content: BranchesPageContent; branches: Branch[]; reviews: ReviewsData; callback: HomeCallback };

/** /filialy/: верх страницы → 2 широкие карточки филиалов → рейтинги и отзывы → «Перезвоните мне». */
export function BranchesView({ content, branches, reviews, callback }: Props) {
  return (
    <div className={styles.page}>
      <div className="container">
        <PageHead title={content.title} lead={content.lead} />

        <div className={styles.list}>
          {branches.map((b) => (
            <BranchCard key={b.id} branch={b} texts={content} />
          ))}
        </div>

        <div className={styles.reviews}>
          <BranchReviews data={reviews} texts={content.reviews} />
        </div>

        <section id="callback" className={styles.callback} aria-labelledby="callback-title">
          <CallbackCard
            content={{ ...callback, title: content.callback.title, subtitle: content.callback.subtitle }}
            titleId="callback-title"
            source={{ page: "/filialy/", label: content.callback.sourceLabel }}
          />
        </section>
      </div>
    </div>
  );
}
