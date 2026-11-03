import { getHomeContent } from "@/lib/api";
import { ButtonLink } from "@/components/ui/Button";
import { Manifesto } from "./Manifesto";
import { PlanBranch } from "./PlanBranch";
import styles from "./PriceUpfront.module.css";

/**
 * Блок 3 главной — «Цена до начала лечения»: манифест, ветка плана из 4 шагов, карточка плана, запись.
 * Предупреждение о противопоказаниях здесь не ставим — на главной оно только в подвале (решение 2B).
 */
export async function PriceUpfront() {
  const { manifesto, plan } = await getHomeContent();

  return (
    <section className={styles.section} aria-labelledby="manifesto-title">
      <div className="container">
        <Manifesto content={manifesto} id="manifesto-title" />
        <PlanBranch content={plan} />
        <div className={styles.cta}>
          <ButtonLink href={plan.cta.href}>{plan.cta.label}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
