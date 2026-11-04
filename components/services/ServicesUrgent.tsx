"use client";

import { Fragment, useEffect, useState } from "react";
import { UrgentCallout } from "@/components/ui/UrgentCallout";
import { clinicNow } from "@/lib/dates";
import type { ServicesIndexContent } from "@/lib/types";

type Props = {
  texts: ServicesIndexContent["urgent"];
  branches: { id: string; name: string }[];
  className?: string;
};

type Window = { time: string; branch: string };

/** Синяя плашка внизу: три ближайших окна на сегодня из getUrgentSlots (api подключаем по монтированию). */
export function ServicesUrgent({ texts, branches, className }: Props) {
  const [windows, setWindows] = useState<Window[] | null>(null);

  useEffect(() => {
    let alive = true;
    import("@/lib/api").then(({ getUrgentSlots }) =>
      getUrgentSlots(clinicNow().date).then((slots) => {
        if (!alive) return;
        const seen = new Set<string>();
        const next: Window[] = [];
        for (const slot of [...slots].sort((a, b) => a.start.localeCompare(b.start))) {
          const key = `${slot.start}|${slot.branchId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          next.push({ time: slot.start.slice(11, 16), branch: branches.find((b) => b.id === slot.branchId)?.name ?? "" });
          if (next.length === 3) break;
        }
        setWindows(next);
      }),
    );
    return () => {
      alive = false;
    };
  }, [branches]);

  // Пока слоты грузятся — пустая строка той же высоты, плашка не прыгает
  const line =
    windows === null ? (
      " "
    ) : windows.length === 0 ? (
      texts.none
    ) : (
      <>
        {texts.prefix}{" "}
        {windows.map((w, i) => (
          <Fragment key={`${w.time}-${w.branch}`}>
            {i > 0 && " · "}
            <b>{w.time}</b> {w.branch}
          </Fragment>
        ))}
      </>
    );

  return <UrgentCallout wide className={className} title={texts.title} text={line} action={texts.cta} href={texts.href} />;
}
