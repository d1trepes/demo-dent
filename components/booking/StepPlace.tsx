import { clinicNow } from "@/lib/dates";
import { cx } from "@/lib/cx";
import { fill, formatYears } from "@/lib/format";
import type { BookingData, BranchId } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import { Avatar } from "./Avatar";
import { Option } from "./Option";
import styles from "./Steps.module.css";

type Props = { data: BookingData; draft: BookingDraft; update: (patch: Partial<BookingDraft>) => void };

/** Шаг 2: филиал, затем врач (по умолчанию — любой свободный). */
export function StepPlace({ data, draft, update }: Props) {
  const t = data.content.place;
  const reason = data.reasons.find((r) => r.id === draft.reasonId);
  const year = Number(clinicNow().date.slice(0, 4));

  // Врачи, которые ведут выбранное направление (и нужную специальность, если выбран повод)
  const suitable = data.doctors.filter(
    (d) => (!draft.directionId || d.directions.includes(draft.directionId)) && (!reason || d.specialty === reason.specialty),
  );
  const inBranch = (branchId: BranchId) =>
    suitable.filter((d) => d.branches.includes(branchId) && (!draft.doctorId || d.id === draft.doctorId));
  const doctors = draft.branchId ? suitable.filter((d) => d.branches.includes(draft.branchId as BranchId)) : [];

  return (
    <div className={styles.stack}>
      <section>
        <h3 className={styles.subheading}>{t.branchHeading}</h3>
        <div className={styles.branches}>
          {data.branches.map((b) => {
            const available = inBranch(b.id).length > 0;
            const selected = draft.branchId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                className={cx(styles.branch, selected && styles.selected)}
                aria-pressed={selected}
                disabled={!available}
                onClick={() => {
                  const keep = suitable.some((d) => d.id === draft.doctorId && d.branches.includes(b.id));
                  update({ branchId: b.id, doctorId: keep ? draft.doctorId : null, slot: null });
                }}
              >
                <span className={styles.optionTitle}>{b.name}</span>
                <span className={styles.optionText}>{b.address.replace("Екатеринбург, ", "")}</span>
                <span className={styles.chips}>
                  {b.hasCT && <span className={styles.chip}>{t.ct}</span>}
                  {b.hasKidsRoom && <span className={styles.chip}>{t.kidsRoom}</span>}
                  {!available && <span className={styles.chip}>{t.branchUnavailable}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className={styles.subheading}>{t.doctorHeading}</h3>
        {!draft.branchId ? (
          <p className={styles.placeholder}>{t.pickBranchFirst}</p>
        ) : doctors.length === 0 ? (
          <p className={styles.placeholder}>{t.noDoctors}</p>
        ) : (
          <div key={draft.branchId} className={cx(styles.grid, styles.reveal)} role="group" aria-label={t.doctorHeading}>
            <Option
              title={t.anyDoctor.title}
              text={t.anyDoctor.text}
              selected={!draft.doctorId}
              onClick={() => update({ doctorId: null, slot: null })}
            />
            {doctors.map((d) => (
              <Option
                key={d.id}
                lead={<Avatar fullName={d.fullName} photo={d.photo} />}
                title={d.fullName}
                text={`${d.position} · ${fill(t.experience, { years: formatYears(year - d.experienceSince) })}`}
                selected={d.id === draft.doctorId}
                onClick={() => update({ doctorId: d.id, slot: null })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
