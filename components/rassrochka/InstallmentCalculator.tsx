"use client";

import { useEffect, useId, useState } from "react";
import { cx } from "@/lib/cx";
import { installment } from "@/lib/calc";
import { fill, formatNumber } from "@/lib/format";
import { bookingHref } from "@/lib/nav";
import type { InstallmentTerms, RassrochkaContent } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./InstallmentCalculator.module.css";

type Props = { content: RassrochkaContent["calc"]; terms: InstallmentTerms; className?: string };

const STEP = 1000;
/** Направление мастера записи, куда ведёт «Записаться на консультацию». */
const BOOKING_SERVICE = "diagnostika";

const clamp = (value: number, terms: InstallmentTerms) => Math.min(Math.max(value, terms.minSum), terms.maxSum);

/**
 * Калькулятор платежа. Начальные значения — из ?sum= и ?months=, читаем после монтирования
 * (статичная страница рендерится со значениями по умолчанию, без расхождения гидрации).
 * Расчёт — чистая installment() из lib/calc.ts, сроки и границы суммы приходят пропсом из services.json.
 */
export function InstallmentCalculator({ content, terms, className }: Props) {
  const [sum, setSum] = useState(() => clamp(content.defaults.sum, terms));
  const [months, setMonths] = useState(content.defaults.months);
  const [text, setText] = useState(() => formatNumber(clamp(content.defaults.sum, terms)));
  const sumId = useId();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sumParam = Number(params.get("sum"));
    const monthsParam = Number(params.get("months"));
    if (Number.isFinite(sumParam) && sumParam >= terms.minSum && sumParam <= terms.maxSum) {
      const rounded = clamp(Math.round(sumParam / STEP) * STEP, terms);
      setSum(rounded);
      setText(formatNumber(rounded));
    }
    if (terms.months.includes(monthsParam)) setMonths(monthsParam);
  }, [terms]);

  const result = installment(sum, months, terms);
  const total = result.sum + result.overpay;
  const money = (value: number) => `${formatNumber(value)} ₽`;

  const onText = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    setText(digits ? formatNumber(Number(digits)) : "");
    setSum(clamp(Number(digits), terms));
  };
  const onSlider = (value: number) => {
    setSum(value);
    setText(formatNumber(value));
  };

  return (
    <div className={cx(styles.calc, className)}>
      <div>
        <label className={styles.label} htmlFor={sumId}>
          {content.sumLabel}
        </label>
        <div className={styles.sum}>
          <input
            id={sumId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text}
            onChange={(e) => onText(e.target.value)}
            onBlur={() => setText(formatNumber(sum))}
          />
          <span aria-hidden>{content.sumSuffix}</span>
        </div>
      </div>

      <div className={styles.rangeBox}>
        <input
          className={styles.range}
          type="range"
          min={terms.minSum}
          max={terms.maxSum}
          step={STEP}
          value={sum}
          aria-label={content.rangeLabel}
          onChange={(e) => onSlider(Number(e.target.value))}
        />
      </div>

      <div className={styles.terms} role="group" aria-label={content.termsLabel}>
        {terms.months.map((m) => (
          <button key={m} type="button" aria-pressed={m === months} onClick={() => setMonths(m)}>
            {fill(content.term, { n: m })}
          </button>
        ))}
      </div>

      <dl className={styles.result} aria-live="polite">
        <div>
          <dt>{content.payLabel}</dt>
          <dd className={styles.pay}>{money(result.monthly)}</dd>
        </div>
        <div>
          <dt>{content.totalLabel}</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <ButtonLink href={`${bookingHref}?service=${BOOKING_SERVICE}&sum=${sum}&months=${months}`} className={styles.book}>
          {content.book.label}
        </ButtonLink>
        <ButtonLink href={content.callback.href} variant="secondary">
          {content.callback.label}
        </ButtonLink>
      </div>
    </div>
  );
}
