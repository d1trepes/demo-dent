/**
 * Типы данных и контракты lib/api.ts. Программист меняет тела функций в api.ts,
 * эти интерфейсы остаются. Даты — строки: день "YYYY-MM-DD", время "HH:mm",
 * момент "YYYY-MM-DDTHH:mm" (местное время клиники, Екатеринбург, UTC+5).
 */

/* ---------- Клиника и филиалы ---------- */

export type BranchId = "center" | "akadem";

export type License = {
  number: string;
  date: string;
  issuer: string;
  registryUrl: string;
};

export type Authority = {
  name: string;
  role: string;
  site: string;
};

export type WorkHours = {
  weekdays: string;
  weekend: string;
};

export type Clinic = {
  name: string;
  shortName: string;
  legalName: string;
  legalNameShort: string;
  inn: string;
  kpp: string;
  ogrn: string;
  legalAddress: string;
  director: string;
  phone: string;
  phoneHref: string;
  email: string;
  telegram: string;
  max: string;
  foundedYear: number;
  positioning: string;
  hours: WorkHours;
  license: License;
  licensedWorks: string[];
  authorities: Authority[];
  demoNote: string;
};

export type Branch = {
  id: BranchId;
  name: string;
  address: string;
  district: string;
  hours: WorkHours;
  phone: string;
  howToGet: string[];
  parking: string;
  chairs: number;
  hasCT: boolean;
  hasKidsRoom: boolean;
  features: string[];
  coords: { lat: number; lng: number };
};

/* ---------- Услуги и прайс ---------- */

export type Specialty = "therapist" | "surgeon" | "orthopedist" | "orthodontist" | "pediatric" | "hygienist";

export type Direction = {
  id: string;
  title: string;
  /** Есть ли отдельная страница /uslugi/[id]/ (8 направлений из паспорта). */
  hasPage: boolean;
  priceFrom: number;
  specialties: Specialty[];
};

export type PriceItem = {
  id: string;
  directionId: string;
  /** Код по номенклатуре медуслуг (в демке вымышленный). */
  code: string;
  title: string;
  /** Слова, по которым позицию находит поиск прайса («чистка» → профгигиена). */
  synonyms: string[];
  price: number;
  priceIsFrom: boolean;
  durationMin: number;
};

export type ImplantSystem = {
  id: string;
  title: string;
  origin: string;
  min: number;
  max: number;
};

export type PriceRange = { id: string; title: string; min: number; max: number };

export type ImplantTariffs = {
  systems: ImplantSystem[];
  crowns: PriceRange[];
  bonePlasty: PriceRange;
  consultationWithCT: number;
  maxTeeth: number;
};

export type InstallmentTerms = {
  months: number[];
  minSum: number;
  maxSum: number;
  overpay: number;
};

export type ServicesData = {
  directions: Direction[];
  items: PriceItem[];
  implant: ImplantTariffs;
  installment: InstallmentTerms;
};

export type Step = { title: string; text: string };
export type Faq = { q: string; a: string };

export type ServicePage = {
  slug: string;
  title: string;
  lead: string;
  forWhom: string[];
  steps: Step[];
  duration: string;
  priceNote: string;
  faq: Faq[];
};

/* ---------- Врачи и расписание ---------- */

/** День недели: 1 — понедельник … 7 — воскресенье. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ScheduleShift = {
  weekday: Weekday;
  branchId: BranchId;
  start: string;
  end: string;
};

export type Education = {
  institution: string;
  year: number;
  qualification: string;
};

export type Certification = {
  kind: "accreditation" | "certificate";
  number: string;
  date: string;
  validUntil: string;
  specialty: string;
};

export type Doctor = {
  id: string;
  slug: string;
  fullName: string;
  specialty: Specialty;
  position: string;
  experienceSince: number;
  category: string | null;
  education: Education[];
  certifications: Certification[];
  branches: BranchId[];
  directions: string[];
  acceptsKids: boolean;
  /** Длительность одного слота записи, мин. */
  slotMin: number;
  schedule: ScheduleShift[];
  photo: string;
  about: string;
};

export type DoctorFilters = {
  specialty?: Specialty;
  branchId?: BranchId;
  directionId?: string;
};

export type SpecialtyInfo = { id: Specialty; title: string; plural: string };

export type DoctorsData = {
  specialties: SpecialtyInfo[];
  doctors: Doctor[];
};

/** Повод для ветки «не знаю, к кому». medical: true — нужен второй чекбокс (данные о здоровье). */
export type Reason = {
  id: string;
  title: string;
  specialty: Specialty;
  directionId: string;
  medical: boolean;
  urgent: boolean;
  kids: boolean;
};

/* ---------- Запись ---------- */

export type Slot = {
  /** "YYYY-MM-DDTHH:mm" */
  start: string;
  durationMin: number;
  doctorId: string;
  branchId: BranchId;
};

export type SlotQuery = {
  serviceId?: string;
  directionId?: string;
  doctorId?: string;
  branchId?: BranchId;
  /** "YYYY-MM-DD" */
  date: string;
};

export type AppointmentStatus = "new" | "confirmed" | "rescheduled" | "cancelled" | "done" | "no_show";

/** Откуда пришла запись — для отчёта владельцу. */
export type AppointmentSource = {
  page: string;
  label: string;
};

export type Consents = {
  personalData: boolean;
  /** Обязателен, только если выбран медицинский повод. */
  health: boolean;
  /** Версия текстов согласий (legal.json), чтобы потом знать, на что согласился пациент. */
  version: string;
};

export type AppointmentPayload = {
  directionId: string;
  serviceId?: string;
  reasonId?: string;
  doctorId: string;
  branchId: BranchId;
  start: string;
  urgent: boolean;
  patient: { name: string; phone: string };
  consents: Consents;
  source: AppointmentSource;
};

export type Appointment = {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
  directionId: string;
  serviceId?: string;
  reasonId?: string;
  doctorId: string;
  branchId: BranchId;
  start: string;
  durationMin: number;
  urgent: boolean;
  patient: { name: string; phone: string };
  source: AppointmentSource;
};

export type CreateAppointmentResult = { id: string; status: "new" };

export type AppointmentChangeResult = {
  id: string;
  status: AppointmentStatus;
  start: string;
};

/** Направление со страницей, позициями прайса и врачами — для /uslugi/[slug]/. */
export type ServiceDetails = {
  direction: Direction;
  page: ServicePage;
  items: PriceItem[];
  doctors: Doctor[];
};

/* ---------- Кабинет пациента ---------- */

export type PatientProfile = {
  id: string;
  fullName: string;
  phone: string;
  birthDate: string;
};

export type PlanStageStatus = "done" | "in_progress" | "planned";

export type PlanStage = {
  id: string;
  title: string;
  items: { title: string; price: number }[];
  sum: number;
  status: PlanStageStatus;
  paid: boolean;
  date: string | null;
};

export type TreatmentPlan = {
  id: string;
  title: string;
  doctorId: string;
  createdAt: string;
  total: number;
  paid: number;
  stages: PlanStage[];
};

export type PatientDocumentKind = "contract" | "act" | "tax" | "consent" | "plan";

export type PatientDocument = {
  id: string;
  kind: PatientDocumentKind;
  title: string;
  date: string;
  /** Путь к PDF-заглушке в public/ (без basePath). */
  file: string;
};

export type ReminderChannel = "sms" | "telegram" | "max";

export type ReminderSettings = {
  channels: Record<ReminderChannel, boolean>;
  before24h: boolean;
  before2h: boolean;
};

export type PayStageResult = { stageId: string; paid: true; receiptId: string };

export type SmsCodeResult = { sent: true; retryAfterSec: number };

/* ---------- Налоговый вычет ---------- */

export type TaxPatientRelation = "self" | "child" | "spouse" | "parent";
export type TaxMethod = "paper" | "fns";
export type TaxRequestStatus = "new" | "in_progress" | "ready" | "issued";

export type TaxCertificatePayload = {
  taxpayerName: string;
  taxpayerInn: string;
  year: number;
  relation: TaxPatientRelation;
  patientName: string | null;
  method: TaxMethod;
  phone: string;
  consents: Consents;
};

export type TaxRequest = {
  id: string;
  createdAt: string;
  status: TaxRequestStatus;
  taxpayerName: string;
  taxpayerInn: string;
  year: number;
  relation: TaxPatientRelation;
  patientName: string | null;
  method: TaxMethod;
  phone: string;
};

/* ---------- Калькуляторы ---------- */

export type ImplantParams = {
  teeth: number;
  systemId: string;
  crownId: string;
  /** Учитывать возможную костную пластику (показываем в «до»). */
  includeBonePlasty: boolean;
};

export type ImplantLine = { title: string; min: number; max: number };

export type ImplantResult = {
  lines: ImplantLine[];
  min: number;
  max: number;
  /** Платёж в рассрочку от суммы «от», по срокам. */
  installments: InstallmentResult[];
};

export type InstallmentResult = {
  sum: number;
  months: number;
  monthly: number;
  overpay: number;
};

/* ---------- Админка ---------- */

export type AdminAppointmentFilters = {
  status?: AppointmentStatus;
  branchId?: BranchId;
  /** "YYYY-MM-DD" */
  date?: string;
};

/* ---------- Прочее ---------- */

export type Promo = {
  id: string;
  title: string;
  text: string;
  directionId: string;
  validUntil: string;
  conditions: string;
};

export type PlatformRating = {
  source: string;
  rating: number;
  count: number;
  url: string;
};

export type Review = {
  id: string;
  source: string;
  author: string;
  date: string;
  rating: number;
  text: string;
};

export type ReviewsData = {
  ratings: PlatformRating[];
  reviews: Review[];
};

export type LegalDocId = "privacy" | "consent" | "healthConsent";

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  version: string;
  updatedAt: string;
  sections: LegalSection[];
};

export type ClinicDocument = {
  id: string;
  title: string;
  file: string;
};

export type LegalData = {
  version: string;
  contraindications: string;
  cookieBanner: string;
  docs: LegalDoc[];
  clinicDocuments: ClinicDocument[];
};

/* ---------- Сырые данные JSON (только для lib/api.ts) ---------- */

/** В моках даты заданы смещением от сегодняшнего дня, чтобы демка всегда выглядела свежей. */
export type RelativeMoment = { day: number; time: string };

export type AppointmentSeed = Omit<Appointment, "start" | "createdAt"> & {
  at: RelativeMoment;
  created: RelativeMoment;
};

export type TaxRequestSeed = Omit<TaxRequest, "createdAt"> & { created: RelativeMoment };

export type PlanStageSeed = Omit<PlanStage, "date"> & { day: number | null };

export type PatientSeed = {
  profile: PatientProfile;
  appointments: AppointmentSeed[];
  plan: Omit<TreatmentPlan, "createdAt" | "stages" | "total" | "paid"> & { createdDay: number; stages: PlanStageSeed[] };
  documents: (Omit<PatientDocument, "date"> & { day: number })[];
  reminders: ReminderSettings;
};

export type AdminSeed = {
  appointments: AppointmentSeed[];
  taxRequests: TaxRequestSeed[];
};

/* ---------- Контент главной ---------- */

export type Picture = { src: string; width: number; height: number; alt: string };

export type HomeLink = { label: string; href: string };

export type HomeHero = {
  /** Заголовок, разорванный аркой: слева — Prata, справа — Prata + одно слово Cormorant Italic. */
  title: { left: string; rightLead: string; rightAccent: string };
  lead: string;
  cta: HomeLink;
  /** Вырезанная по силуэту фигура врача (.webp с прозрачностью). */
  photo: Picture;
  /** Подпись списка услуг для скринридера. */
  marqueeLabel: string;
  /** Бегущая строка услуг внизу hero. */
  marquee: HomeLink[];
};

export type HomeContent = { hero: HomeHero };
