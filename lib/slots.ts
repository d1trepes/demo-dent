/**
 * Свободные слоты из расписания врачей (doctors.json → schedule).
 * Занятость псевдослучайная, но детерминированная: одна и та же дата, врач и время
 * всегда дают один результат — слоты не «прыгают» при перезагрузке.
 * В бою слоты приходят из МИС клиники (docs/HANDOFF.md → getSlots).
 */
import { addDays, clinicNow, fromMinutes, moment, toMinutes, weekdayOf } from "./dates";
import type { Doctor, Slot } from "./types";

/** Доля занятых слотов. */
const BUSY_RATE = 0.55;
/** Не предлагаем время, до которого осталось меньше, мин. */
const MIN_LEAD_MIN = 45;

/** FNV-1a: строка → число 0…1. */
function hash01(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

export function isBusy(doctorId: string, start: string): boolean {
  return hash01(`${doctorId}|${start}`) < BUSY_RATE;
}

type GenerateOptions = {
  now?: { date: string; time: string };
  /** Уже занятые в этой сессии моменты "YYYY-MM-DDTHH:mm" этого врача. */
  taken?: ReadonlySet<string>;
};

/** Свободные слоты врача на день. */
export function doctorSlots(doctor: Pick<Doctor, "id" | "schedule" | "slotMin">, date: string, options: GenerateOptions = {}): Slot[] {
  const now = options.now ?? clinicNow();
  if (date < now.date) return [];
  const weekday = weekdayOf(date);
  const earliest = date === now.date ? toMinutes(now.time) + MIN_LEAD_MIN : 0;
  const slots: Slot[] = [];

  for (const shift of doctor.schedule) {
    if (shift.weekday !== weekday) continue;
    const end = toMinutes(shift.end);
    for (let t = toMinutes(shift.start); t + doctor.slotMin <= end; t += doctor.slotMin) {
      if (t < earliest) continue;
      const start = moment(date, fromMinutes(t));
      if (isBusy(doctor.id, start) || options.taken?.has(start)) continue;
      slots.push({ start, durationMin: doctor.slotMin, doctorId: doctor.id, branchId: shift.branchId });
    }
  }
  return slots;
}

/** Слоты нескольких врачей на день, по времени. */
export function slotsForDoctors(doctors: Doctor[], date: string, options: GenerateOptions = {}): Slot[] {
  return doctors
    .flatMap((d) => doctorSlots(d, date, options))
    .sort((a, b) => a.start.localeCompare(b.start) || a.doctorId.localeCompare(b.doctorId));
}

/** Ближайший свободный слот среди врачей в пределах N дней (для «ближайшее время» на главной). */
export function nearestSlot(doctors: Doctor[], fromDate: string, days = 14, options: GenerateOptions = {}): Slot | null {
  for (let i = 0; i < days; i++) {
    const found = slotsForDoctors(doctors, addDays(fromDate, i), options)[0];
    if (found) return found;
  }
  return null;
}
