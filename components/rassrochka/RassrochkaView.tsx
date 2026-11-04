import { CallbackCard } from "@/components/home/CallbackCard";
import { Manifesto } from "@/components/home/Manifesto";
import { PlanBranch } from "@/components/home/PlanBranch";
import type { HomeCallback, InstallmentTerms, RassrochkaContent } from "@/lib/types";
import { InstallmentHero } from "./InstallmentHero";
import styles from "./RassrochkaView.module.css";

type Props = { content: RassrochkaContent; terms: InstallmentTerms; callback: HomeCallback };

/**
 * Страница /rassrochka/: hero с калькулятором → манифест-заголовок → ветка из 4 шагов → «Перезвоним и посчитаем».
 * Предупреждение о противопоказаниях — только в подвале (docs/DESIGN.md).
 */
export function RassrochkaView({ content, terms, callback }: Props) {
  const source = { page: "/rassrochka/", label: content.callback.sourceLabel };

  return (
    <div className={styles.page}>
      <div className="container">
        <InstallmentHero content={content} terms={terms} />

        <div className={styles.main}>
          <Manifesto content={content.manifesto} id="rassrochka-manifesto" />
          <PlanBranch content={content.plan} compact />

          <section id="callback" className={styles.callback} aria-labelledby="callback-title">
            <CallbackCard
              content={{ ...callback, title: content.callback.title, subtitle: content.callback.subtitle }}
              titleId="callback-title"
              source={source}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
