import { useEffect, useMemo, useState } from "react";
import { addDays, clinicNow } from "@/lib/dates";
import { cx } from "@/lib/cx";
import { formatMonthShort, formatWeekdayShort, timeOf } from "@/lib/format";
import type { BookingData, Slot } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import styles from "./Steps.module.css";

type Props = { data: BookingData; draft: BookingDraft; update: (patch: Partial<BookingDraft>) => void };

/** Сколько ближайших дней просматриваем. */
const DAYS_AHEAD = 14;

function partOf(start: string): "morning" | "day" | "evening" {
  const hour = Number(start.slice(11, 13));
  return hour < 12 ? "morning" : hour < 17 ? "day" : "evening";
}

/** Шаг 3: свободные даты (ближайшие сверху) и время. Занятые слоты api не отдаёт. */
export function StepTime({ data, draft, update }: Props) {
  const t = data.content.time;
  const reason = data.reasons.find((r) => r.id === draft.reasonId);
  const specialty = reason?.specialty;
  const { serviceId, directionId, doctorId, branchId } = draft;
  const [byDate, setByDate] = useState<Record<string, Slot[]> | null>(null);
  const [picked, setPicked] = useState<string | null>(draft.slot ? draft.slot.start.slice(0, 10) : null);
  const today = clinicNow().date;

  useEffect(() => {
    let cancelled = false;
    setByDate(null);
    (async () => {
      const { getSlots } = await import("@/lib/api");
      const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
      const results = await Promise.all(
        dates.map((date) =>
          getSlots({
            date,
            serviceId: serviceId ?? undefined,
            directionId: directionId ?? undefined,
            doctorId: doctorId ?? undefined,
            branchId: branchId ?? undefined,
            specialty,
          }),
        ),
      );
      if (cancelled) return;
      const next: Record<string, Slot[]> = {};
      dates.forEach((date, i) => {
        // Если врач не выбран, на одно время может быть несколько врачей — показываем время один раз
        const seen = new Set<string>();
        const unique = results[i].filter((s) => (doctorId || !seen.has(s.start) ? (seen.add(s.start), true) : false));
        if (unique.length) next[date] = unique;
      });
      setByDate(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId, directionId, doctorId, branchId, specialty, today]);

  const dates = useMemo(() => (byDate ? Object.keys(byDate).sort() : []), [byDate]);
  const activeDate = picked && byDate?.[picked] ? picked : (dates[0] ?? null);

  if (!byDate) {
    return (
      <p className={styles.placeholder} role="status">
        {t.loading}
      </p>
    );
  }
  if (!activeDate) return <p className={styles.placeholder}>{t.empty}</p>;

  const slots = byDate[activeDate];
  const parts = (["morning", "day", "evening"] as const)
    .map((part) => ({ part, slots: slots.filter((s) => partOf(s.start) === part) }))
    .filter((p) => p.slots.length > 0);

  return (
    <div className={styles.stack}>
      <section>
        <h3 className={styles.subheading}>{t.datesLabel}</h3>
        <div className={styles.dates} role="group" aria-label={t.datesLabel}>
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              className={cx(styles.date, date === activeDate && styles.selected)}
              aria-pressed={date === activeDate}
              onClick={() => setPicked(date)}
            >
              <span className={styles.dateWeekday}>{date === today ? t.today : formatWeekdayShort(date)}</span>
              <span className={styles.dateDay}>{Number(date.slice(8, 10))}</span>
              <span className={styles.dateMonth}>{formatMonthShort(date)}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className={styles.subheading}>{t.timesLabel}</h3>
        <div key={activeDate} className={cx(styles.stack, styles.reveal)}>
          {parts.map(({ part, slots: list }) => (
            <div key={part}>
              <p className={styles.partLabel}>{t.dayParts[part]}</p>
              <div className={styles.times} role="group" aria-label={t.dayParts[part]}>
                {list.map((s) => {
                  const selected = draft.slot?.start === s.start && draft.slot.doctorId === s.doctorId;
                  return (
                    <button
                      key={`${s.start}-${s.doctorId}`}
                      type="button"
                      className={cx(styles.time, selected && styles.selected)}
                      aria-pressed={selected}
                      onClick={() => update({ slot: s })}
                    >
                      {timeOf(s.start)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
