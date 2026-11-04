/** Предзаполнение мастера из адреса: ?service= (id услуги или направления) &doctor= (slug или id) &branch= &reason= &mode=urgent. */
import { fill } from "@/lib/format";
import type { BookingData, BranchId } from "@/lib/types";
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

  let step: BookingStep = 1;
  if (directionId) step = branchId ? 3 : 2;

  const query = params.toString();
  const label = doctor
    ? fill(content.source.doctor, { name: doctor.fullName })
    : item
      ? fill(content.source.service, { title: item.title })
      : direction
        ? fill(content.source.direction, { title: direction.title })
        : content.source.fallback;

  return {
    mode: reason ? "unknown" : "planned",
    step,
    directionId,
    serviceId: item?.id ?? null,
    reasonId: reason?.id ?? null,
    doctorId: doctor?.id ?? null,
    branchId,
    source: { page: query ? `/zapis/?${query}` : "/zapis/", label },
  };
}
