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
  /** Только врачи этой специальности (ветка «не знаю, к кому»). */
  specialty?: Specialty;
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

/* ---------- Обратный звонок (блок 8 главной, 2E) ---------- */

/** Повода и свободного текста нет — значит, согласие на данные о здоровье не нужно. */
export type CallbackPayload = {
  name: string;
  /** "+7 (999) 123-45-67" — как ввёл пациент, с маской. */
  phone: string;
  /** Версия текста согласия на ПДн (legal.json → version). */
  consentVersion: string;
};

export type CallbackStatus = "new" | "called" | "booked" | "no_answer";

export type CreateCallbackResult = { id: string; status: "new" };

/** Заявка в панели администратора. */
export type CallbackRequest = {
  id: string;
  /** "YYYY-MM-DDTHH:mm", время клиники. */
  createdAt: string;
  status: CallbackStatus;
  name: string;
  phone: string;
  consentVersion: string;
  source: AppointmentSource;
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

/** Лист «ветви ясеня» в hero: ярус (сверху вниз — к плашке бледнее) и сторона от стебля. */
export type HeroLeaf = {
  tier: "top" | "middle" | "bottom";
  side: "left" | "right";
  src: string;
  alt: string;
};

export type HomeHero = {
  /** «Лечим всей» — Prata мельче, «семьёй» — Prata капсом (регистр задаёт CSS). */
  title: { lead: string; accent: string };
  /** Мелкий белый текст по бокам синей плашки, по строкам. Только десктоп. */
  asideLeft: string[];
  asideRight: string[];
  /** Врач в овале, снят на фоне цвета плашки. */
  photo: Picture;
  doctorsLink: HomeLink;
  /** 6 листьев (640×640): на мобильном остаётся только нижняя пара. */
  leaves: HeroLeaf[];
};

/** Строка блока 2 «Направления». Цена — только из services.json (priceFrom), здесь её нет. */
export type HomeDirectionRow = {
  directionId: string;
  /** До 60 знаков, без обещаний результата. */
  description: string;
  /** Подпись под ценой, например «под ключ». */
  priceNote?: string;
  /** Фото-таблетка (декоративное, alt пустой). */
  photo: Picture;
};

export type HomeDirections = {
  title: string;
  allPrices: HomeLink;
  rows: HomeDirectionRow[];
  /** Плашка-акцент после направлений → срочная запись. */
  urgent: HomeLink & { text: string; action: string };
};

/** Манифест блока 3: текст с фото-таблетками внутри строки. */
export type ManifestoSegment = { kind: "text"; text: string } | { kind: "pill"; image: Picture };

export type HomeManifesto = { segments: ManifestoSegment[] };

/** Шаг ветки плана. Фото листа подготовлено под правый лист (основание внизу слева). */
export type PlanBranchStep = {
  number: string;
  title: string;
  text: string;
  leaf: Picture;
};

export type HomePlan = {
  steps: PlanBranchStep[];
  cta: HomeLink;
};

/** Деталь импланта (блок 4): подпись и точка, от которой идёт линия, — в долях кадра видео (по кадру максимального разбора). */
export type ImplantPart = {
  id: "crown" | "abutment" | "screw";
  title: string;
  /** 1–2 строки, без обещаний результата. */
  text: string;
  anchor: { x: number; y: number };
};

/** Видео импланта, проматываемое скроллом (2C-2): отрезок «максимальный разбор → правильная сборка». */
export type ImplantVideo = {
  src: string;
  /** Собранный кадр — до загрузки видео. */
  poster: string;
  width: number;
  height: number;
};

export type HomeImplant = {
  title: string;
  paragraphs: string[];
  video: ImplantVideo;
  /** Статичный кадр разбора: мобильный и reduced-motion. */
  exploded: Picture;
  parts: ImplantPart[];
};

/** Блок 5 «Врачи» (2C-1): порядок врачей на главной, первый — в большой карточке. Фото — Doctor.photo, все 3:4. */
export type HomeDoctors = {
  title: string;
  allDoctors: HomeLink;
  slugs: string[];
  photo: { width: number; height: number };
  bookLabel: string;
  profileLabel: string;
  thumbsLabel: string;
};

/** Клинический случай блока 6 (2D): нейтральная подпись — что сделано, кто делал, сколько визитов. Без слов о результате. */
export type BeforeAfterCase = {
  id: string;
  title: string;
  specialty: string;
  visits: number;
  /** Пары 1200×1200, выровнены по кадру — при движении ползунка зубы не прыгают. */
  before: Picture;
  after: Picture;
};

export type HomeBeforeAfter = {
  title: string;
  sliderLabel: string;
  beforeLabel: string;
  afterLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** Формы слова для числа визитов: 1, 2–4, 5+. */
  visitsWord: [string, string, string];
  cta: HomeLink;
  cases: BeforeAfterCase[];
};

/** Карточка филиала в блоке 7 (правка 2D): название — из branches.json, подзаголовок и 2 фото. Адрес, часы, отзывы — на /filialy/. */
export type HomeBranchCard = {
  branchId: BranchId;
  /** Одна строка о том, чем филиал отличается, без обещаний результата. */
  subtitle: string;
  photos: Picture[];
};

export type HomeBranches = {
  title: string;
  /** Фото-таблетка в строке заголовка — после слова с номером `after`. */
  titlePill: { after: number; image: Picture };
  /** Шаблон абзаца: {weekdays}, {weekend}, {kidsBranch}, {ctBranch} подставляются из branches.json. */
  intro: string;
  routeLink: HomeLink;
  cards: HomeBranchCard[];
  /** 2 доп. фото 1:1 слева внизу — декоративные, alt пустой. */
  extras: Picture[];
};

/** Блок 8 «Перезвоните мне» (2E). Сообщение об успехе — шаблон с {name}. */
export type HomeCallback = {
  title: string;
  subtitle: string;
  nameLabel: string;
  phoneLabel: string;
  consentLabel: string;
  consentDocLabel: string;
  policyLabel: string;
  submit: string;
  sending: string;
  success: string;
  bookOnline: HomeLink;
  errors: { name: string; phone: string; consent: string; submit: string };
  /** Вырезанное фото врача (прозрачный фон). */
  photo: Picture;
};

export type HomeContent = {
  hero: HomeHero;
  directions: HomeDirections;
  manifesto: HomeManifesto;
  plan: HomePlan;
  implant: HomeImplant;
  doctors: HomeDoctors;
  beforeAfter: HomeBeforeAfter;
  branchesBlock: HomeBranches;
  callback: HomeCallback;
};

/* ---------- Мастер онлайн-записи (тексты — data/booking.json) ---------- */

export type BookingItem = Pick<PriceItem, "id" | "directionId" | "title" | "price" | "priceIsFrom" | "durationMin">;

export type BookingDoctor = Pick<
  Doctor,
  "id" | "slug" | "fullName" | "specialty" | "position" | "experienceSince" | "branches" | "directions" | "acceptsKids" | "photo"
>;

/** Всё, что мастеру нужно «с сервера»: страница собирает это при сборке через lib/api.ts. */
export type BookingData = {
  directions: Direction[];
  items: BookingItem[];
  reasons: Reason[];
  branches: Branch[];
  doctors: BookingDoctor[];
  specialties: SpecialtyInfo[];
  consentsVersion: string;
  content: BookingContent;
};

export type BookingContent = {
  title: string;
  lead: string;
  urgentLead: string;
  stepsLabel: string;
  stepOf: string;
  backTo: string;
  steps: { service: string; place: string; time: string; contacts: string; done: string };
  nav: { back: string; next: string; submit: string; submitting: string };
  service: {
    heading: string;
    tabs: { known: string; unknown: string };
    directionsLabel: string;
    itemsHeading: string;
    anyItem: string;
    reasonsLabel: string;
    reasonsHint: string;
    urgentHint: { title: string; text: string; action: string };
  };
  place: {
    branchHeading: string;
    doctorHeading: string;
    anyDoctor: { title: string; text: string };
    noDoctors: string;
    pickBranchFirst: string;
    branchUnavailable: string;
    kidsRoom: string;
    ct: string;
    experience: string;
  };
  time: {
    heading: string;
    loading: string;
    empty: string;
    today: string;
    dayParts: { morning: string; day: string; evening: string };
    datesLabel: string;
    timesLabel: string;
  };
  urgent: {
    heading: string;
    reasonLabel: string;
    loading: string;
    today: string;
    shiftedDay: string;
    empty: string;
    showMore: string;
    notUrgent: string;
    kids: { text: string; action: string };
  };
  contacts: {
    heading: string;
    lead: string;
    nameLabel: string;
    phoneLabel: string;
    personal: { label: string; docLabel: string; policyLabel: string };
    health: { label: string; docLabel: string; hint: string };
    errors: { name: string; phone: string; personal: string; health: string; submit: string };
    slotTaken: string;
    chooseOther: string;
    demoNote: string;
  };
  summary: {
    title: string;
    rows: { service: string; reason: string; branch: string; doctor: string; time: string };
    empty: string;
    anyDoctor: string;
    minutes: string;
  };
  source: { fallback: string; urgent: string; doctor: string; service: string; direction: string };
  done: {
    title: string;
    lead: string;
    urgentLead: string;
    status: string;
    rows: { doctor: string; branch: string; address: string; time: string; service: string; number: string };
    calendar: string;
    another: string;
    notFound: { title: string; text: string; action: string };
    reminders: { title: string; text: string; before24: string; before2: string; joiner: string; none: string; settings: string };
    ics: { summary: string; description: string };
  };
};

/* ---------- Страница /ceny/ ---------- */

export type PricesContent = {
  title: string;
  lead: string;
  searchLabel: string;
  searchPlaceholder: string;
  /** Плейсхолдер компактного поиска в боковой колонке. */
  searchShort: string;
  clear: string;
  popular: string[];
  /** «{n} {word}» — счётчик в шапке раздела. */
  count: string;
  serviceForms: [string, string, string];
  empty: { title: string; text: string };
  tocLabel: string;
  aboutDirection: string;
  facts: {
    duration: string;
    minutes: string;
    code: string;
    price: string;
    perTooth: string;
    fixed: string;
    multi: string;
  };
  book: string;
  free: string;
  from: string;
};

/* ---------- Страница /uslugi/ ---------- */

export type ServicesIndexCard = {
  /** id направления из services.json — ссылка /uslugi/<id>/ и цена. */
  directionId: string;
  category: string;
  wide: boolean;
  name: string;
  short: string;
  /** Подпись цены у широкой карточки. */
  priceLabel?: string;
  /** Синонимы для поиска. */
  words: string[];
  /** Путь к .webp в public/; пустая строка — серая заглушка с описанием кадра. */
  image: string;
  shot: string;
};

/** Карточка с ценой из services.json (в JSON страницы цен нет). */
export type ServicesIndexCardView = ServicesIndexCard & { price: number; priceIsFrom: boolean };

export type ServicesIndexContent = {
  title: string;
  lead: string;
  searchLabel: string;
  searchShort: string;
  clear: string;
  categoriesLabel: string;
  from: string;
  more: string;
  categories: { id: string; label: string }[];
  cards: ServicesIndexCard[];
  urgent: { title: string; prefix: string; none: string; cta: string; href: string };
  /** text содержит {phone}. */
  empty: { title: string; text: string };
  aside: { title: string; text: string; link: string; href: string };
};
