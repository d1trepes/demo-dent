"use client";

import { useId, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Contraindications } from "@/components/ui/Contraindications";
import { formatPrice, formatPriceRange } from "@/lib/format";
import type { HomeImplantCalculator } from "@/lib/types";
import styles from "./ImplantCalculator.module.css";

/** Расчёт для одной комбинации «система × число зубов». Считается на сервере через calcImplant/calcInstallment. */
export type ImplantQuote = { systemId: string; teeth: number; min: number; max: number; monthly: number };

export type ImplantSystemOption = { id: string; title: string; origin: string };

type Props = {
  content: HomeImplantCalculator;
  systems: ImplantSystemOption[];
  quotes: ImplantQuote[];
};

/**
 * Калькулятор-тизер имплантации (блок 4). Цифры не считает сам — берёт готовую таблицу,
 * посчитанную из services.json через lib/api.ts (так в клиент не попадает весь прайс).
 */
export function ImplantCalculator({ content, systems, quotes }: Props) {
  const [teeth, setTeeth] = useState(1);
  const [systemId, setSystemId] = useState(systems[0]?.id ?? "");
  const uid = useId();
  const quote = quotes.find((q) => q.systemId === systemId && q.teeth === teeth);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{content.title}</h3>

      <div className={styles.controls}>
        <fieldset className={styles.field}>
          <legend className={styles.legend}>{content.teethLabel}</legend>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.step}
              aria-label="Меньше зубов"
              disabled={teeth <= 1}
              onClick={() => setTeeth((t) => Math.max(1, t - 1))}
            >
              <span aria-hidden="true">−</span>
            </button>
            <output className={styles.count} aria-live="polite">
              {teeth}
            </output>
            <button
              type="button"
              className={styles.step}
              aria-label="Больше зубов"
              disabled={teeth >= content.maxTeeth}
              onClick={() => setTeeth((t) => Math.min(content.maxTeeth, t + 1))}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend className={styles.legend}>{content.systemLabel}</legend>
          <div className={styles.segments}>
            {systems.map((s) => (
              <label key={s.id} className={styles.segment}>
                <input
                  type="radio"
                  name={`${uid}-system`}
                  value={s.id}
                  checked={systemId === s.id}
                  onChange={() => setSystemId(s.id)}
                  className="visually-hidden"
                />
                <span className={styles.segmentTitle}>{s.title}</span>
                <span className={styles.segmentOrigin}>{s.origin}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.result}>
        <div aria-live="polite">
          <p className={styles.resultLabel}>{content.totalLabel}</p>
          <p className={styles.total}>{quote ? formatPriceRange(quote.min, quote.max) : "—"}</p>
          {quote && (
            <p className={styles.monthly}>
              {content.monthlyLabel} — {formatPrice(quote.monthly, true)} в месяц
            </p>
          )}
        </div>
        <ButtonLink href={content.cta.href} className={styles.cta}>
          {content.cta.label}
        </ButtonLink>
      </div>

      <p className={styles.note}>{content.note}</p>
      <Contraindications variant="inline" className={styles.warning} />
    </div>
  );
}
