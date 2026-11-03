import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import type { HomePlan, InstallmentResult, TreatmentPlan } from "@/lib/types";
import styles from "./PlanCard.module.css";

/** Карточка «Пример плана лечения» возле шага 02: этапы, суммы, итог, рассрочка. Все цифры — из данных. */
export function PlanCard({
  plan,
  installment,
  labels,
  className,
}: {
  plan: TreatmentPlan;
  installment: InstallmentResult;
  labels: HomePlan["card"];
  className?: string;
}) {
  return (
    <div className={cx(styles.card, className)}>
      <p className={styles.caption}>{labels.caption}</p>
      <h3 className={styles.title}>{plan.title}</h3>

      <ol className={styles.stages}>
        {plan.stages.map((stage) => (
          <li key={stage.id} className={styles.stage}>
            <span>{stage.title}</span>
            <span className={styles.sum}>{formatPrice(stage.sum)}</span>
          </li>
        ))}
      </ol>

      <p className={styles.total}>
        <span className={styles.totalLabel}>{labels.totalLabel}</span>
        <span className={styles.totalSum}>{formatPrice(plan.total)}</span>
      </p>
      <p className={styles.installment}>
        {labels.installmentLabel.split(/(\{sum\}\S*)/).map((part) =>
          part.startsWith("{sum}") ? (
            <span key={part} className={styles.nowrap}>
              {part.replace("{sum}", formatPrice(installment.monthly, true))}
            </span>
          ) : (
            part
          ),
        )}
      </p>
    </div>
  );
}
