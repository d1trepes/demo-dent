"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addDays, clinicNow } from "@/lib/dates";
import type { BranchId, Doctor, DoctorsPageContent, Slot, Specialty, SpecialtyInfo } from "@/lib/types";
import { DoctorCard } from "./DoctorCard";
import { DoctorsAside, type DoctorsFilter } from "./DoctorsAside";
import styles from "./DoctorsView.module.css";

type Props = {
  texts: DoctorsPageContent;
  doctors: Doctor[];
  specialties: SpecialtyInfo[];
  branches: { id: BranchId; name: string }[];
};

const DAYS_AHEAD = 7;
const EMPTY: DoctorsFilter = { specialty: null, branch: null, kids: false };

function readFilter(specialties: SpecialtyInfo[], branches: Props["branches"]): DoctorsFilter {
  const params = new URLSearchParams(window.location.search);
  return {
    specialty: specialties.find((s) => s.id === params.get("specialty"))?.id ?? null,
    branch: branches.find((b) => b.id === params.get("branch"))?.id ?? null,
    kids: params.get("kids") === "1",
  };
}

function writeFilter(filter: DoctorsFilter) {
  const params = new URLSearchParams();
  if (filter.specialty) params.set("specialty", filter.specialty);
  if (filter.branch) params.set("branch", filter.branch);
  if (filter.kids) params.set("kids", "1");
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

const matches = (d: Doctor, f: DoctorsFilter, specialty: Specialty | null = f.specialty) =>
  (!specialty || d.specialty === specialty) && (!f.branch || d.branches.includes(f.branch)) && (!f.kids || d.acceptsKids);

/** /vrachi/: липкий фильтр слева (пишется в адрес ?specialty= &branch= &kids=1), справа карточки в 2 колонки. */
export function DoctorsView({ texts, doctors, specialties, branches }: Props) {
  const [filter, setFilter] = useState<DoctorsFilter>(EMPTY);
  const [nearest, setNearest] = useState<Record<string, Slot | null> | null>(null);

  useEffect(() => setFilter(readFilter(specialties, branches)), [specialties, branches]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getSlots } = await import("@/lib/api");
      const today = clinicNow().date;
      const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
      const entries = await Promise.all(
        doctors.map(async (d) => {
          const days = await Promise.all(dates.map((date) => getSlots({ doctorId: d.id, date })));
          return [d.id, days.find((list) => list.length > 0)?.[0] ?? null] as const;
        }),
      );
      if (!cancelled) setNearest(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [doctors]);

  const change = (patch: Partial<DoctorsFilter>) => {
    const next = { ...filter, ...patch };
    setFilter(next);
    writeFilter(next);
  };

  const counts = useMemo(
    () =>
      Object.fromEntries([
        ["all", doctors.filter((d) => matches(d, filter, null)).length],
        ...specialties.map((s) => [s.id, doctors.filter((d) => matches(d, filter, s.id)).length]),
      ]) as Record<string, number>,
    [doctors, specialties, filter],
  );
  const shown = doctors.filter((d) => matches(d, filter));
  const branchName = new Map(branches.map((b) => [b.id, b.name]));
  const specialtyTitle = new Map(specialties.map((s) => [s.id, s.title]));

  return (
    <div className={styles.page}>
      <div className="container">
        <header>
          <h1 className={styles.title}>{texts.title}</h1>
          <p className={styles.lead}>{texts.lead}</p>
        </header>

        <div className={styles.layout}>
          <DoctorsAside
            texts={texts.list}
            specialties={specialties}
            branches={branches}
            filter={filter}
            counts={counts}
            onChange={change}
          />

          <div className={styles.grid}>
            {shown.map((d) => (
              <DoctorCard
                key={d.id}
                doctor={d}
                texts={texts.list}
                specialty={specialtyTitle.get(d.specialty) ?? ""}
                branches={d.branches.map((id) => branchName.get(id) ?? id)}
                nearest={nearest ? (nearest[d.id] ?? null) : undefined}
              />
            ))}
            {shown.length === 0 && (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>{texts.list.empty.title}</p>
                <p className={styles.emptyText}>{texts.list.empty.text}</p>
                <Button variant="secondary" onClick={() => change(EMPTY)}>
                  {texts.list.empty.reset}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
