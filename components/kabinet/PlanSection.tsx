import { useState } from "react";
import { Avatar } from "@/components/booking/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { fill, formatDate, formatPrice } from "@/lib/format";
import type { BookingData, CabinetContent, PlanStage } from "@/lib/types";
import { usePatientStore } from "@/store/patientStore";
import { PayDialog } from "./PayDialog";
import styles from "./Cabinet.module.css";

type Props = { texts: CabinetContent; data: BookingData; notify: (text: string) => void };

/** Раздел «План лечения»: этапы строками с суммами, итог и остаток кобальтом, оплата этапа — заглушка. */
export function PlanSection({ texts, data, notify }: Props) {
  const plan = usePatientStore((s) => s.plan);
  const [paying, setPaying] = useState<PlanStage | null>(null);
  const t = texts.plan;
  if (!plan) return null;
  const doctor = data.doctors.find((d) => d.id === plan.doctorId);

  return (
    <section id="plan" className={styles.section} aria-labelledby="plan-title">
      <h2 id="plan-title" className={styles.sectionTitle}>
        {texts.sections.plan}
      </h2>
      <div className={styles.card}>
        <div className={styles.apRow}>
          <div>
            <p className={styles.apWhen}>{plan.title}</p>
            <p className={styles.muted}>{fill(t.createdLabel, { date: formatDate(plan.createdAt) })}</p>
          </div>
          {doctor && (
            <div className={styles.doctor}>
              <Avatar fullName={doctor.fullName} photo={doctor.photo} />
              <div>
                <p className={styles.muted}>{t.doctorLabel}</p>
                <p className={styles.doctorName}>{doctor.fullName}</p>
              </div>
            </div>
          )}
        </div>

        <ol className={styles.stages}>
          {plan.stages.map((st, i) => (
            <li key={st.id} className={styles.stage}>
              <span className={styles.stageNo}>{i + 1}</span>
              <div>
                <p className={styles.stageTitle}>{st.title}</p>
                <ul className={styles.stageItems}>
                  {st.items.map((item) => (
                    <li key={item.title}>
                      {item.title} — {formatPrice(item.price)}
                    </li>
                  ))}
                </ul>
                <p className={styles.muted}>
                  {t.stageStatuses[st.status]}
                  {st.date && `, ${formatDate(st.date)}`}
                </p>
              </div>
              <div className={styles.stageSide}>
                <p className={styles.stageSum}>{formatPrice(st.sum)}</p>
                {st.paid || st.sum === 0 ? (
                  <span className={styles.status} data-status="done">
                    {t.paidBadge}
                  </span>
                ) : (
                  <Button variant="secondary" onClick={() => setPaying(st)}>
                    {t.pay}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ol>

        <dl className={styles.totals}>
          <div>
            <dt>{t.total}</dt>
            <dd>{formatPrice(plan.total)}</dd>
          </div>
          <div>
            <dt>{t.paid}</dt>
            <dd>{formatPrice(plan.paid)}</dd>
          </div>
          <div className={styles.left}>
            <dt>{t.left}</dt>
            <dd>{formatPrice(plan.total - plan.paid)}</dd>
          </div>
        </dl>
        <div className={styles.planFoot}>
          <p className={styles.note}>{t.note}</p>
          <ButtonLink href={t.installment.href} variant="secondary">
            {t.installment.label}
          </ButtonLink>
        </div>
      </div>

      {paying && (
        <PayDialog
          stage={paying}
          texts={t.dialog}
          errorText={texts.error}
          onClose={() => setPaying(null)}
          onPaid={() => {
            notify(fill(t.paidToast, { title: paying.title }));
            setPaying(null);
          }}
        />
      )}
    </section>
  );
}
