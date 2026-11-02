/**
 * Калькуляторы имплантации и рассрочки. Чистые функции: тарифы приходят из services.json
 * через lib/api.ts (calcImplant, calcInstallment), здесь только арифметика.
 */
import type { ImplantParams, ImplantResult, ImplantTariffs, InstallmentResult, InstallmentTerms } from "./types";

/** Округляем платёж вверх до 10 ₽, чтобы сумма платежей покрывала итог. */
const roundUp10 = (value: number) => Math.ceil(value / 10) * 10;

export function installment(sum: number, months: number, terms: InstallmentTerms): InstallmentResult {
  if (!terms.months.includes(months)) {
    throw new Error(`Срок рассрочки ${months} мес. не предусмотрен`);
  }
  const clamped = Math.min(Math.max(sum, 0), terms.maxSum);
  const overpay = Math.round((clamped * terms.overpay) / 100);
  return { sum: clamped, months, monthly: roundUp10((clamped + overpay) / months), overpay };
}

export function implant(params: ImplantParams, tariffs: ImplantTariffs, terms: InstallmentTerms): ImplantResult {
  const system = tariffs.systems.find((s) => s.id === params.systemId);
  const crown = tariffs.crowns.find((c) => c.id === params.crownId);
  if (!system || !crown) throw new Error("Неизвестная система импланта или коронка");

  const teeth = Math.min(Math.max(Math.round(params.teeth), 1), tariffs.maxTeeth);
  const lines = [
    { title: "Консультация хирурга и КТ", min: tariffs.consultationWithCT, max: tariffs.consultationWithCT },
    { title: `Имплант «${system.title}» (${system.origin}) × ${teeth}`, min: system.min * teeth, max: system.max * teeth },
    { title: `Коронка: ${crown.title.toLowerCase()} × ${teeth}`, min: crown.min * teeth, max: crown.max * teeth },
  ];
  if (params.includeBonePlasty) {
    lines.push({ title: tariffs.bonePlasty.title, min: tariffs.bonePlasty.min * teeth, max: tariffs.bonePlasty.max * teeth });
  }

  const min = lines.reduce((s, l) => s + l.min, 0);
  const max = lines.reduce((s, l) => s + l.max, 0);
  const installments = terms.months.map((m) => installment(min, m, terms));
  return { lines, min, max, installments };
}
