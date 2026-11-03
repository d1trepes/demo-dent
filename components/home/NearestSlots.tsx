"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { getUrgentSlots } from "@/lib/api";
import { addDays, clinicNow } from "@/lib/dates";
import type { BranchId, Slot } from "@/lib/types";
import styles from "./NearestSlots.module.css";

type BranchRef = { id: BranchId; name: string };
type Nearest = { branch: BranchRef; slot: Slot | null; day: "today" | "tomorrow" };

type Props = { title: string; branches: BranchRef[] };

/** Ближайшее свободное время в каждом филиале: сегодня, а если уже нет — завтра. Считается в браузере. */
async function loadNearest(branches: BranchRef[]): Promise<Nearest[]> {
  const today = clinicNow().date;
  const todaySlots = await getUrgentSlots(today);
  const missing = branches.filter((b) => !todaySlots.some((s) => s.branchId === b.id));
  const tomorrowSlots = missing.length ? await getUrgentSlots(addDays(today, 1)) : [];

  const earliest = (list: Slot[], id: BranchId) =>
    list.filter((s) => s.branchId === id).sort((a, b) => a.start.localeCompare(b.start))[0] ?? null;

  return branches.map((branch) => {
    const t = earliest(todaySlots, branch.id);
    return t ? { branch, slot: t, day: "today" } : { branch, slot: earliest(tomorrowSlots, branch.id), day: "tomorrow" };
  });
}

export function NearestSlots({ title, branches }: Props) {
  const [items, setItems] = useState<Nearest[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadNearest(branches).then((r) => alive && setItems(r));
    return () => {
      alive = false;
    };
  }, [branches]);

  return (
    <div className={styles.card}>
      <p className={styles.title}>
        <span className={styles.pulse} aria-hidden />
        {title}
      </p>
      <ul className={styles.list} aria-busy={items === null}>
        {(items ?? branches.map((branch) => ({ branch, slot: null, day: "today" as const }))).map(
          ({ branch, slot, day }) => (
            <li key={branch.id}>
              <Link href={`/zapis/?mode=urgent&branch=${branch.id}`} className={styles.chip}>
                <span className={styles.branch}>{branch.name}</span>
                <span className={styles.time}>
                  {items === null ? (
                    <span className={styles.skeleton}>
                      <span className="visually-hidden">Загружаем время</span>
                    </span>
                  ) : slot ? (
                    <>
                      {day === "today" ? "сегодня" : "завтра"} <strong>{slot.start.slice(11)}</strong>
                    </>
                  ) : (
                    "по записи"
                  )}
                </span>
                <ArrowUpRight aria-hidden size={18} className={styles.arrow} />
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
