"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import steps from "@/components/booking/Steps.module.css";
import { addDays, clinicNow } from "@/lib/dates";
import { cx } from "@/lib/cx";
import { formatMonthShort, formatWeekdayShort, timeOf } from "@/lib/format";
import type { DoctorsPageContent, Slot } from "@/lib/types";
import styles from "./DoctorSlots.module.css";

type Props = { doctorId: string; slug: string; texts: DoctorsPageContent["profile"]["slots"] };

const DAYS_AHEAD = 7;
const PARTS = ["morning", "day", "evening"] as const;
const partOf = (start: string) => {
  const hour = Number(start.slice(11, 13));
  return hour < 12 ? "morning" : hour < 17 ? "day" : "evening";
};

/** 7 дней чипами (стили шага «Время» мастера) → слоты дня; клик ведёт в мастер с выбранным временем. */
export function DoctorSlots({ doctorId, slug, texts }: Props) {
  const [byDate, setByDate] = useState<[string, Slot[]][] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const today = clinicNow().date;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getSlots } = await import("@/lib/api");
      const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
      const lists = await Promise.all(dates.map((date) => getSlots({ doctorId, date })));
      if (cancelled) return;
      setByDate(dates.map((date, i) => [date, lists[i]]));
      setPicked(dates.find((_, i) => lists[i].length > 0) ?? dates[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorId, today]);

  if (!byDate) {
    return (
      <p className={steps.placeholder} role="status">
        {texts.loading}
      </p>
    );
  }
  if (byDate.every(([, list]) => list.length === 0)) return <p className={steps.placeholder}>{texts.noneWeek}</p>;

  const slots = byDate.find(([date]) => date === picked)?.[1] ?? [];
  const parts = PARTS.map((part) => ({ part, list: slots.filter((s) => partOf(s.start) === part) })).filter((p) => p.list.length);
  const href = (s: Slot) => `/zapis/?${new URLSearchParams({ doctor: slug, branch: s.branchId, slot: s.start })}`;

  return (
    <div className={steps.stack}>
      <div className={steps.dates} role="group" aria-label={texts.title}>
        {byDate.map(([date, list]) => (
          <button
            key={date}
            type="button"
            className={cx(steps.date, styles.date, date === picked && steps.selected)}
            aria-pressed={date === picked}
            disabled={list.length === 0}
            onClick={() => setPicked(date)}
          >
            <span className={steps.dateWeekday}>{date === today ? texts.today : formatWeekdayShort(date)}</span>
            <span className={steps.dateDay}>{Number(date.slice(8, 10))}</span>
            <span className={steps.dateMonth}>{formatMonthShort(date)}</span>
          </button>
        ))}
      </div>

      <div key={picked} className={cx(steps.stack, steps.reveal)}>
        {parts.length === 0 && <p className={steps.placeholder}>{texts.empty}</p>}
        {parts.map(({ part, list }) => (
          <div key={part}>
            <p className={steps.partLabel}>{texts.dayParts[part]}</p>
            <div className={cx(steps.times, styles.times)}>
              {list.map((s) => (
                <Link key={s.start} href={href(s)} className={cx(steps.time, styles.time)}>
                  {timeOf(s.start)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
