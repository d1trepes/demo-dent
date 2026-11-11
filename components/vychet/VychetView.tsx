import { CallbackCard } from "@/components/home/CallbackCard";
import { PlanBranch } from "@/components/home/PlanBranch";
import { PageHead } from "@/components/ui/PageHead";
import type { Branch, HomeCallback, VychetContent } from "@/lib/types";
import { TaxForm } from "./TaxForm";
import styles from "./VychetView.module.css";

type Props = { content: VychetContent; branches: Branch[]; callback: HomeCallback };

/** /vychet/: верх → карточка заявки на справку → «Как получить вычет» веткой → «Перезвоните мне». */
export function VychetView({ content, branches, callback }: Props) {
  const { form, aside } = content;
  return (
    <div className={styles.page}>
      <div className="container">
        <PageHead title={content.title} lead={content.lead} />

        <section id="zayavka" className={styles.card} aria-labelledby="tax-form-title">
          <div className={styles.main}>
            <h2 id="tax-form-title" className={styles.formTitle}>
              {form.title}
            </h2>
            <p className={styles.formLead}>{form.lead}</p>
            <TaxForm texts={form} branches={branches} />
          </div>
          <aside className={styles.aside} aria-labelledby="tax-aside-title">
            <h3 id="tax-aside-title" className={styles.asideTitle}>
              {aside.title}
            </h3>
            <ul className={styles.asideList}>
              {aside.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.asideNote}>{aside.note}</p>
          </aside>
        </section>

        <section className={styles.how} aria-labelledby="tax-how-title">
          <h2 id="tax-how-title" className={styles.howTitle}>
            {content.howTitle}
          </h2>
          <PlanBranch content={content.plan} compact />
        </section>

        <section id="callback" className={styles.callback} aria-labelledby="callback-title">
          <CallbackCard
            content={{ ...callback, title: content.callback.title, subtitle: content.callback.subtitle }}
            titleId="callback-title"
            source={{ page: "/vychet/", label: content.callback.sourceLabel }}
          />
        </section>
      </div>
    </div>
  );
}
