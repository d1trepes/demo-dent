import { formatMoment, fill, shortName } from "@/lib/format";
import type { BookingData } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import styles from "./Wizard.module.css";

type Props = { data: BookingData; draft: BookingDraft };

/** Боковая сводка: что уже выбрано. Обновляется на каждом шаге. */
export function Summary({ data, draft }: Props) {
  const { content } = data;
  const t = content.summary;
  const reason = data.reasons.find((r) => r.id === draft.reasonId);
  const item = data.items.find((i) => i.id === draft.serviceId);
  const direction = data.directions.find((d) => d.id === draft.directionId);
  const branch = data.branches.find((b) => b.id === (draft.slot?.branchId ?? draft.branchId));
  const doctor = data.doctors.find((d) => d.id === (draft.slot?.doctorId ?? draft.doctorId));

  const rows: { label: string; value: string | null; hint?: string }[] = [
    reason
      ? { label: t.rows.reason, value: reason.title }
      : { label: t.rows.service, value: item?.title ?? direction?.title ?? null },
    { label: t.rows.branch, value: branch ? `${branch.name}, ${branch.address.replace("Екатеринбург, ", "")}` : null },
    {
      label: t.rows.doctor,
      value: doctor ? shortName(doctor.fullName) : draft.branchId ? t.anyDoctor : null,
      hint: doctor?.position,
    },
    {
      label: t.rows.time,
      value: draft.slot ? formatMoment(draft.slot.start) : null,
      hint: draft.slot ? fill(t.minutes, { n: draft.slot.durationMin }) : undefined,
    },
  ];

  return (
    <aside className={styles.summary} aria-label={t.title}>
      <h2 className={styles.summaryTitle}>{t.title}</h2>
      <dl className={styles.summaryList}>
        {rows.map((row) => (
          <div key={row.label} className={styles.summaryRow}>
            <dt>{row.label}</dt>
            <dd className={row.value ? undefined : styles.summaryEmpty}>
              {row.value ?? t.empty}
              {row.value && row.hint && <span className={styles.summaryHint}>{row.hint}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
