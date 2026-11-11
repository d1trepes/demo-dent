/** Предзаполнение мастера из адреса: ?service= (id услуги или направления) &doctor= (slug или id) &branch= &slot= (с карточки врача) &reason= &mode=urgent|unknown &sum= &months= (рассрочка). */
import { installment } from "@/lib/calc";
import { fill, formatNumber } from "@/lib/format";
import { doctorSlots } from "@/lib/slots";
import type { BookingData, BookingDoctor, BookingInstallment, BranchId, Slot } from "@/lib/types";
import type { BookingDraft, BookingStep } from "@/store/bookingStore";

const BRANCH_IDS: readonly BranchId[] = ["center", "akadem"];

export function initFromParams(params: URLSearchParams, data: BookingData): Partial<BookingDraft> {
  const { directions, items, reasons, doctors, content } = data;
  const serviceParam = params.get("service");
  const urgent = params.get("mode") === "urgent";

  const item = items.find((i) => i.id === serviceParam);
  const direction = directions.find((d) => d.id === (item?.directionId ?? serviceParam));
  const paramReason = reasons.find((r) => r.id === params.get("reason"));

  if (urgent) {
    const reason = reasons.find((r) => r.id === paramReason?.id && r.urgent && !r.kids) ?? reasons.find((r) => r.urgent && !r.kids);
    return {
      mode: "urgent",
      step: 3,
      reasonId: reason?.id ?? null,
      directionId: reason?.directionId ?? null,
      source: { page: `/zapis/?${params.toString()}`, label: content.source.urgent },
    };
  }

  // Услуга из адреса сильнее повода
  const reason = direction ? undefined : paramReason;
  const directionId = direction?.id ?? reason?.directionId ?? null;

  const wanted = params.get("doctor");
  let doctor = doctors.find((d) => d.slug === wanted || d.id === wanted);
  if (doctor && directionId && !doctor.directions.includes(directionId)) doctor = undefined;
  if (doctor && reason && doctor.specialty !== reason.specialty) doctor = undefined;

  const wantedBranch = BRANCH_IDS.find((b) => b === params.get("branch"));
  const branchId =
    wantedBranch && (!doctor || doctor.branches.includes(wantedBranch))
      ? wantedBranch
      : doctor && doctor.branches.length === 1
        ? doctor.branches[0]
        : null;

  // ?slot= с карточки врача: время ещё свободно → сразу шаг «Контакты», направление — первое у врача
  const slot = doctor && branchId ? freeSlot(doctor, branchId, params.get("slot")) : null;
  const slotDirectionId = slot && doctor ? (directionId ?? doctor.directions.find((id) => directions.some((d) => d.id === id)) ?? null) : null;

  let step: BookingStep = 1;
  if (directionId) step = branchId ? 3 : 2;
  if (slot && slotDirectionId) step = 4;

  const plan = installmentFromParams(params, data);
  const query = params.toString();
  const label = plan
    ? fill(content.source.installment, { sum: formatNumber(plan.sum), months: plan.months })
    : doctor
    ? fill(content.source.doctor, { name: doctor.fullName })
    : item
      ? fill(content.source.service, { title: item.title })
      : direction
        ? fill(content.source.direction, { title: direction.title })
        : content.source.fallback;

  return {
    mode: reason || (!direction && params.get("mode") === "unknown") ? "unknown" : "planned",
    step,
    directionId: slotDirectionId ?? directionId,
    serviceId: item?.id ?? null,
    reasonId: reason?.id ?? null,
    doctorId: doctor?.id ?? null,
    branchId,
    ...(slot && slotDirectionId ? { slot } : {}),
    ...(plan ? { installment: plan } : {}),
    source: { page: query ? `/zapis/?${query}` : "/zapis/", label },
  };
}

/** ?sum= и ?months= — только если оба допустимы по условиям рассрочки (services.json → installment). */
function installmentFromParams(params: URLSearchParams, data: BookingData): BookingInstallment | null {
  const terms = data.installment;
  const sum = Number(params.get("sum"));
  const months = Number(params.get("months"));
  if (!Number.isFinite(sum) || sum < terms.minSum || sum > terms.maxSum || !terms.months.includes(months)) return null;
  return { sum, months, monthly: installment(sum, months, terms).monthly };
}

/** Слот из адреса, только если он есть среди свободных у врача в этом филиале. */
function freeSlot(doctor: BookingDoctor, branchId: BranchId, value: string | null): Slot | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const found = doctorSlots(doctor, value.slice(0, 10)).find((s) => s.start === value && s.branchId === branchId);
  return found ?? null;
}
