/**
 * Единственная точка обращения к «серверу». Сейчас — заглушки на JSON из data/
 * с задержкой 300–600 мс (в браузере; при сборке — без задержки).
 * Программист меняет только тела функций (описание — docs/HANDOFF.md),
 * сигнатуры и типы из lib/types.ts остаются. Данные никуда не отправляются.
 */
import aboutData from "@/data/about.json";
import adminData from "@/data/admin.json";
import bookingData from "@/data/booking.json";
import branchesData from "@/data/branches.json";
import branchesPageData from "@/data/branchesPage.json";
import clinicData from "@/data/clinic.json";
import doctorsData from "@/data/doctors.json";
import doctorsPageData from "@/data/doctorsPage.json";
import homeData from "@/data/home.json";
import kabinetData from "@/data/kabinet.json";
import legalData from "@/data/legal.json";
import patientData from "@/data/patient.json";
import pricesData from "@/data/prices.json";
import promosData from "@/data/promos.json";
import akciiData from "@/data/akcii.json";
import rassrochkaData from "@/data/rassrochka.json";
import reasonsData from "@/data/reasons.json";
import reviewsData from "@/data/reviews.json";
import servicePageTextsData from "@/data/servicePage.json";
import servicePagesData from "@/data/servicePages.json";
import servicesIndexData from "@/data/servicesIndex.json";
import servicesData from "@/data/services.json";
import vychetData from "@/data/vychet.json";
import { implant, installment } from "./calc";
import { clinicNow, fromRelative, relativeDay } from "./dates";
import { slotsForDoctors } from "./slots";
import type {
  BookingContent,
  AdminAppointmentFilters,
  AdminSeed,
  Appointment,
  AppointmentChangeResult,
  AppointmentPayload,
  AppointmentSeed,
  AppointmentStatus,
  Branch,
  CallbackPayload,
  Clinic,
  CreateAppointmentResult,
  CreateCallbackResult,
  Direction,
  Doctor,
  HomeContent,
  DoctorFilters,
  DoctorsPageContent,
  DoctorsData,
  ImplantParams,
  ImplantResult,
  InstallmentResult,
  LegalData,
  LegalDoc,
  LegalDocId,
  PatientDocument,
  PatientProfile,
  PatientSeed,
  AboutContent,
  PayStageResult,
  Promo,
  PromosContent,
  Reason,
  ReminderSettings,
  PricesContent,
  RassrochkaContent,
  BranchesPageContent,
  VychetContent,
  InstallmentTerms,
  KabinetContent,
  ReviewsData,
  ServiceDetails,
  ServicePageTexts,
  ServicePage,
  ServicesIndexContent,
  ServicesData,
  Slot,
  SlotQuery,
  SmsCodeResult,
  SpecialtyInfo,
  TaxCertificatePayload,
  TaxRequest,
  TreatmentPlan,
} from "./types";

/* ---------- Данные ---------- */

const clinic = clinicData as Clinic;
const branches = branchesData as Branch[];
const services = servicesData as ServicesData;
const servicePages = servicePagesData as ServicePage[];
const doctors = doctorsData as DoctorsData;
const reasons = reasonsData as Reason[];
const promos = promosData as Promo[];
const reviews = reviewsData as ReviewsData;
const patient = patientData as PatientSeed;
const admin = adminData as AdminSeed;
const legal = legalData as LegalData;
const home = homeData as HomeContent;

/** Демо-код из SMS. */
export const DEMO_SMS_CODE = "1234";


/* ---------- Служебное ---------- */

export class ApiError extends Error {
  constructor(
    public readonly code: "not_found" | "invalid_code" | "slot_taken" | "validation",
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Пауза «сервера» 120–240 мс (8Б: было 300–600, интерфейс казался медленным). Только в браузере: при статической сборке ждать нечего. */
function wait(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const ms = 120 + Math.round(Math.random() * 120);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function respond<T>(value: T): Promise<T> {
  await wait();
  return structuredClone(value);
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const nowMoment = () => {
  const n = clinicNow();
  return `${n.date}T${n.time}`;
};

/** Время, занятое записями этой сессии (в бою — проверка на стороне МИС). */
const takenSlots = new Set<string>();
const takenKey = (doctorId: string, start: string) => `${doctorId}|${start}`;

function materializeAppointment(seed: AppointmentSeed): Appointment {
  const { at, created, ...rest } = seed;
  return { ...rest, start: fromRelative(at), createdAt: fromRelative(created) };
}

/* ---------- Клиника ---------- */

export function getClinic(): Promise<Clinic> {
  return respond(clinic);
}

/** Тексты и картинки главной (в бою — CMS или те же JSON). */
export function getHomeContent(): Promise<HomeContent> {
  return respond(home);
}

/** Тексты /o-klinike/, /o-klinike/dokumenty/ и юр.страниц. */
export function getAboutContent(): Promise<AboutContent> {
  return respond(aboutData as AboutContent);
}

/** Тексты /filialy/. */
export function getBranchesPageContent(): Promise<BranchesPageContent> {
  return respond(branchesPageData as BranchesPageContent);
}

/** Тексты /vychet/. */
export function getVychetContent(): Promise<VychetContent> {
  return respond(vychetData as VychetContent);
}

export function getBranches(): Promise<Branch[]> {
  return respond(branches);
}

export async function getLegalDoc(id: LegalDocId): Promise<LegalDoc> {
  const doc = legal.docs.find((d) => d.id === id);
  if (!doc) throw new ApiError("not_found", `Документ ${id} не найден`);
  return respond(doc);
}

export function getLegal(): Promise<LegalData> {
  return respond(legal);
}

/* ---------- Услуги и прайс ---------- */

export function getServices(): Promise<Pick<ServicesData, "directions" | "items">> {
  return respond({ directions: services.directions, items: services.items });
}

/** Тексты страницы /ceny/. */
export function getPricesContent(): Promise<PricesContent> {
  return respond(pricesData as PricesContent);
}

/** Тексты страницы /rassrochka/. */
export function getRassrochkaContent(): Promise<RassrochkaContent> {
  return respond(rassrochkaData as RassrochkaContent);
}

/** Сроки и границы суммы рассрочки (services.json → installment). */
export function getInstallmentTerms(): Promise<InstallmentTerms> {
  return respond(servicesData.installment);
}

/** Тексты и карточки страницы /uslugi/. */
export function getServicesIndexContent(): Promise<ServicesIndexContent> {
  return respond(servicesIndexData as ServicesIndexContent);
}

/** Общие тексты шаблона страницы услуги. */
export function getServicePageTexts(): Promise<ServicePageTexts> {
  return respond(servicePageTextsData as ServicePageTexts);
}

export async function getService(slug: string): Promise<ServiceDetails | null> {
  const direction = services.directions.find((d) => d.id === slug && d.hasPage);
  const page = servicePages.find((p) => p.slug === slug);
  if (!direction || !page) return respond(null);
  return respond({
    direction,
    page,
    items: page.priceItemIds.map((id) => {
      const item = services.items.find((i) => i.id === id);
      if (!item) throw new ApiError("not_found", `Позиция прайса ${id} не найдена (страница ${slug})`);
      return item;
    }),
    doctors: doctors.doctors.filter((d) => d.directions.includes(slug)),
    branches,
  });
}

/** Направления со своей страницей — для generateStaticParams. */
export function getServiceSlugs(): Promise<string[]> {
  return respond(services.directions.filter((d) => d.hasPage).map((d) => d.id));
}

export function getBookingContent(): Promise<BookingContent> {
  return respond(bookingData as BookingContent);
}

export function getReasons(): Promise<Reason[]> {
  return respond(reasons);
}

export function getPromos(): Promise<Promo[]> {
  return respond(promos);
}

export function getPromosContent(): Promise<PromosContent> {
  return respond(akciiData as PromosContent);
}

export function getReviews(): Promise<ReviewsData> {
  return respond(reviews);
}

/* ---------- Врачи ---------- */

/** Тексты /vrachi/ и карточки врача. */
export function getDoctorsPageContent(): Promise<DoctorsPageContent> {
  return respond(doctorsPageData as DoctorsPageContent);
}

export function getSpecialties(): Promise<SpecialtyInfo[]> {
  return respond(doctors.specialties);
}

function filterDoctors(filters: DoctorFilters = {}): Doctor[] {
  return doctors.doctors.filter(
    (d) =>
      (!filters.specialty || d.specialty === filters.specialty) &&
      (!filters.branchId || d.branches.includes(filters.branchId)) &&
      (!filters.directionId || d.directions.includes(filters.directionId)),
  );
}

export function getDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
  return respond(filterDoctors(filters));
}

export function getDoctor(slug: string): Promise<Doctor | null> {
  return respond(doctors.doctors.find((d) => d.slug === slug) ?? null);
}

/* ---------- Слоты и запись ---------- */

function directionOf(query: Pick<SlotQuery, "serviceId" | "directionId">): Direction | undefined {
  const directionId = query.directionId ?? services.items.find((i) => i.id === query.serviceId)?.directionId;
  return services.directions.find((d) => d.id === directionId);
}

function takenFor(doctorList: Doctor[]): Set<string> {
  const ids = new Set(doctorList.map((d) => d.id));
  const result = new Set<string>();
  for (const key of takenSlots) {
    const [doctorId, start] = key.split("|");
    if (ids.has(doctorId)) result.add(start);
  }
  return result;
}

export function getSlots(query: SlotQuery): Promise<Slot[]> {
  const direction = directionOf(query);
  const list = query.doctorId
    ? doctors.doctors.filter((d) => d.id === query.doctorId)
    : filterDoctors({ branchId: query.branchId, directionId: direction?.id, specialty: query.specialty });
  const slots = slotsForDoctors(list, query.date, { taken: takenFor(list) }).filter(
    (s) => !query.branchId || s.branchId === query.branchId,
  );
  return respond(slots);
}

/** Слоты на день у терапевтов и хирургов во всех филиалах — ветка «Острая боль». */
export function getUrgentSlots(date: string): Promise<Slot[]> {
  const list = doctors.doctors.filter((d) => d.specialty === "therapist" || d.specialty === "surgeon");
  return respond(slotsForDoctors(list, date, { taken: takenFor(list) }));
}

export async function createAppointment(payload: AppointmentPayload): Promise<CreateAppointmentResult> {
  if (!payload.consents.personalData) throw new ApiError("validation", "Нужно согласие на обработку персональных данных");
  const reason = reasons.find((r) => r.id === payload.reasonId);
  if (reason?.medical && !payload.consents.health) {
    throw new ApiError("validation", "Нужно согласие на обработку данных о здоровье");
  }
  const key = takenKey(payload.doctorId, payload.start);
  if (takenSlots.has(key)) throw new ApiError("slot_taken", "Это время только что заняли, выберите другое");
  takenSlots.add(key);
  return respond({ id: newId("ap"), status: "new" as const });
}

export async function rescheduleAppointment(id: string, slot: Slot): Promise<AppointmentChangeResult> {
  takenSlots.add(takenKey(slot.doctorId, slot.start));
  return respond({ id, status: "rescheduled" as AppointmentStatus, start: slot.start });
}

export async function cancelAppointment(id: string): Promise<{ id: string; status: AppointmentStatus }> {
  return respond({ id, status: "cancelled" as AppointmentStatus });
}

/* ---------- Обратный звонок ---------- */

/** Заявка «Перезвоните мне» (блок 8 главной). В бою — очередь администратора + уведомление в Telegram/MAX. */
export async function createCallbackRequest(payload: CallbackPayload): Promise<CreateCallbackResult> {
  if (!payload.consentVersion) throw new ApiError("validation", "Нужно согласие на обработку персональных данных");
  if (payload.phone.replace(/\D/g, "").length !== 11) throw new ApiError("validation", "Проверьте номер телефона");
  return respond({ id: newId("cb"), status: "new" as const });
}

/* ---------- Кабинет ---------- */

export function getKabinetContent(): Promise<KabinetContent> {
  return respond(kabinetData as KabinetContent);
}

export async function requestSmsCode(phone: string): Promise<SmsCodeResult> {
  if (phone.replace(/\D/g, "").length !== 11) throw new ApiError("validation", "Проверьте номер телефона");
  return respond({ sent: true as const, retryAfterSec: 60 });
}

export async function verifySmsCode(phone: string, code: string): Promise<PatientProfile> {
  await wait();
  if (code !== DEMO_SMS_CODE) throw new ApiError("invalid_code", "Неверный код. В демо подходит 1234");
  return structuredClone({ ...patient.profile, phone });
}

export function getPatientProfile(): Promise<PatientProfile> {
  return respond(patient.profile);
}

export function getAppointments(): Promise<Appointment[]> {
  return respond(patient.appointments.map(materializeAppointment));
}

export function getTreatmentPlan(): Promise<TreatmentPlan> {
  const { createdDay, stages, ...rest } = patient.plan;
  const fullStages = stages.map(({ day, ...s }) => ({ ...s, date: day === null ? null : relativeDay(day) }));
  return respond({
    ...rest,
    createdAt: relativeDay(createdDay),
    stages: fullStages,
    total: fullStages.reduce((sum, s) => sum + s.sum, 0),
    paid: fullStages.filter((s) => s.paid).reduce((sum, s) => sum + s.sum, 0),
  });
}

export function getDocuments(): Promise<PatientDocument[]> {
  return respond(patient.documents.map(({ day, ...d }) => ({ ...d, date: relativeDay(day) })));
}

export async function payPlanStage(stageId: string): Promise<PayStageResult> {
  if (!patient.plan.stages.some((s) => s.id === stageId)) throw new ApiError("not_found", "Этап не найден");
  return respond({ stageId, paid: true as const, receiptId: newId("rc") });
}

export function getReminderSettings(): Promise<ReminderSettings> {
  return respond(patient.reminders);
}

export function updateReminderSettings(settings: ReminderSettings): Promise<ReminderSettings> {
  return respond(settings);
}

/* ---------- Налоговый вычет ---------- */

export async function createTaxCertificateRequest(payload: TaxCertificatePayload): Promise<TaxRequest> {
  if (!payload.consents.personalData) throw new ApiError("validation", "Нужно согласие на обработку персональных данных");
  if (!/^\d{12}$/.test(payload.taxpayerInn)) throw new ApiError("validation", "ИНН физлица — 12 цифр");
  if (payload.method === "paper" && !payload.branchId) throw new ApiError("validation", "Выберите филиал для бумажной справки");
  const request: TaxRequest = {
    id: newId("tx"),
    createdAt: nowMoment(),
    status: "new",
    taxpayerName: payload.taxpayerName,
    taxpayerInn: payload.taxpayerInn,
    year: payload.year,
    relation: payload.relation,
    patientName: payload.patientName,
    method: payload.method,
    branchId: payload.method === "paper" ? payload.branchId : null,
    phone: payload.phone,
  };
  return respond(request);
}

/* ---------- Калькуляторы (считаются локально) ---------- */

export function calcImplant(params: ImplantParams): ImplantResult {
  return implant(params, services.implant, services.installment);
}

export function calcInstallment(sum: number, months: number): InstallmentResult {
  return installment(sum, months, services.installment);
}

export function getImplantTariffs(): Promise<Pick<ServicesData, "implant" | "installment">> {
  return respond({ implant: services.implant, installment: services.installment });
}

/* ---------- Админка ---------- */

export function getAdminAppointments(filters: AdminAppointmentFilters = {}): Promise<Appointment[]> {
  const list = admin.appointments
    .map(materializeAppointment)
    .filter(
      (a) =>
        (!filters.status || a.status === filters.status) &&
        (!filters.branchId || a.branchId === filters.branchId) &&
        (!filters.date || a.start.startsWith(filters.date)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return respond(list);
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<{ id: string; status: AppointmentStatus }> {
  return respond({ id, status });
}

export function getTaxRequests(): Promise<TaxRequest[]> {
  return respond(
    admin.taxRequests.map(({ created, ...t }) => ({ ...t, createdAt: fromRelative(created) })),
  );
}

