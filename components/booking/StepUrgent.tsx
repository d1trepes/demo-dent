import { useEffect, useMemo, useState } from "react";
import { addDays, clinicNow } from "@/lib/dates";
import { cx } from "@/lib/cx";
import { fill, formatDayMonth, formatWeekday, shortName, timeOf } from "@/lib/format";
import type { BookingData, BranchId, Slot } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import { Button, ButtonLink } from "@/components/ui/Button";
import styles from "./Steps.module.css";

type Props = {
  data: BookingData;
  draft: BookingDraft;
  update: (patch: Partial<BookingDraft>) => void;
  /** Вернуться в обычную запись (не срочно). */
  onPlanned: () => void;
};

/** Сколько дней вперёд ищем, если сегодня мест нет. */
const DAYS_AHEAD = 7;
/** Слотов на филиал до «Показать ещё». */
const PER_BRANCH = 9;

/** Ветка «острая боль»: слоты на сегодня сразу по обоим филиалам, без выбора услуги и врача. */
export function StepUrgent({ data, draft, update, onPlanned }: Props) {
  const t = data.content.urgent;
  const today = clinicNow().date;
  const [days, setDays] = useState<{ date: string; slots: Slot[] }[] | null>(null);
  const [expanded, setExpanded] = useState<Partial<Record<BranchId, boolean>>>({});

  const reasons = data.reasons.filter((r) => r.urgent && !r.kids);
  const reason = reasons.find((r) => r.id === draft.reasonId) ?? reasons[0];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getUrgentSlots } = await import("@/lib/api");
      const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
      const lists = await Promise.all(dates.map((date) => getUrgentSlots(date)));
      if (!cancelled) setDays(dates.map((date, i) => ({ date, slots: lists[i] })));
    })();
    return () => {
      cancelled = true;
    };
  }, [today]);

  // Первый день, где у нужной специальности есть свободное время
  const shown = useMemo(() => {
    if (!days || !reason) return null;
    const specialtyOf = (doctorId: string) => data.doctors.find((d) => d.id === doctorId)?.specialty;
    for (const day of days) {
      const slots = day.slots.filter((s) => specialtyOf(s.doctorId) === reason.specialty);
      if (slots.length) return { date: day.date, slots };
    }
    return { date: today, slots: [] as Slot[] };
  }, [days, reason, today, data.doctors]);

  if (!days || !shown || !reason) {
    return (
      <p className={styles.placeholder} role="status">
        {t.loading}
      </p>
    );
  }

  return (
    <div className={styles.stack}>
      <section>
        <h3 className={styles.subheading}>{t.reasonLabel}</h3>
        <div className={styles.segment} role="group" aria-label={t.reasonLabel}>
          {reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              className={cx(styles.tab, r.id === reason.id && styles.tabActive)}
              aria-pressed={r.id === reason.id}
              onClick={() => update({ reasonId: r.id, directionId: r.directionId, serviceId: null, slot: null })}
            >
              {r.title}
            </button>
          ))}
        </div>
      </section>

      {shown.date !== today && shown.slots.length > 0 && (
        <p className={styles.hint} role="status">
          {fill(t.shiftedDay, { day: `${formatWeekday(shown.date)}, ${formatDayMonth(shown.date)}` })}
        </p>
      )}

      {shown.slots.length === 0 ? (
        <p className={styles.placeholder}>{t.empty}</p>
      ) : (
        data.branches.map((branch) => {
          const list = shown.slots.filter((s) => s.branchId === branch.id);
          if (list.length === 0) return null;
          const visible = expanded[branch.id] ? list : list.slice(0, PER_BRANCH);
          return (
            <section key={branch.id}>
              <h3 className={styles.subheading}>
                {branch.name}
                <span className={styles.subheadingNote}>{branch.address.replace("Екатеринбург, ", "")}</span>
              </h3>
              <div className={styles.slotCards} role="group" aria-label={branch.name}>
                {visible.map((s) => {
                  const doctor = data.doctors.find((d) => d.id === s.doctorId);
                  const selected = draft.slot?.start === s.start && draft.slot.doctorId === s.doctorId;
                  return (
                    <button
                      key={`${s.start}-${s.doctorId}`}
                      type="button"
                      className={cx(styles.slotCard, selected && styles.selected)}
                      aria-pressed={selected}
                      onClick={() => update({ slot: s, branchId: s.branchId, doctorId: s.doctorId })}
                    >
                      <span className={styles.slotTime}>{timeOf(s.start)}</span>
                      <span className={styles.optionText}>{doctor ? shortName(doctor.fullName) : ""}</span>
                    </button>
                  );
                })}
              </div>
              {list.length > PER_BRANCH && !expanded[branch.id] && (
                <Button variant="secondary" className={styles.more} onClick={() => setExpanded((e) => ({ ...e, [branch.id]: true }))}>
                  {t.showMore}
                </Button>
              )}
            </section>
          );
        })
      )}

      <div className={styles.callout}>
        <p>{t.kids.text}</p>
        <ButtonLink href="/zapis/?reason=kid-pain" variant="secondary">
          {t.kids.action}
        </ButtonLink>
      </div>
      <button type="button" className={styles.textLink} onClick={onPlanned}>
        {t.notUrgent}
      </button>
    </div>
  );
}
