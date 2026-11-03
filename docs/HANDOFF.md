# Передача программисту (каркас, дополняется по чатам)

Все обращения к «серверу» — только `lib/api.ts`. Заменяете тела функций на реальные запросы, сигнатуры и типы (`lib/types.ts`) не меняете. Сейчас всё на JSON из `/data`, задержка 300–600 мс только в браузере, данные никуда не уходят.

## Функции lib/api.ts
| Функция | Возвращает | Подключить |
| --- | --- | --- |
| getClinic(), getBranches(), getLegal(), getLegalDoc(id) | Clinic, Branch[], LegalData, LegalDoc | CMS или оставить JSON |
| getServices(), getService(slug), getServiceSlugs() | направления и прайс, ServiceDetails | прайс из МИС/1С |
| getDoctors(filters), getDoctor(slug), getSpecialties() | Doctor[] | МИС |
| getReasons(), getPromos(), getReviews() | Reason[], Promo[], ReviewsData | CMS |
| getSlots(query), getUrgentSlots(date) | Slot[] | МИС: свободное время (IDENT, 1С:Медицина. Стоматология, Dental4Windows) |
| createAppointment(payload) | { id, status: 'new' } | МИС + уведомление администратору (Telegram/MAX/почта) |
| rescheduleAppointment(id, slot), cancelAppointment(id) | AppointmentChangeResult | МИС |
| requestSmsCode(phone), verifySmsCode(phone, code) | SmsCodeResult, PatientProfile | SMS-шлюз, сессия в cookie |
| getPatientProfile(), getAppointments(), getTreatmentPlan(), getDocuments() | кабинет | МИС |
| getReminderSettings(), updateReminderSettings(s) | ReminderSettings | рассылка напоминаний за 24 ч и 2 ч |
| payPlanStage(stageId) | PayStageResult | ЮKassa или банк клиники, чеки |
| createTaxCertificateRequest(payload) | TaxRequest | очередь администратора, статус в кабинете |
| createCallbackRequest({ name, phone, consentVersion }) | { id, status: 'new' } | заявка «Перезвоните мне» → очередь администратора + уведомление в Telegram/MAX; логировать согласие (версия текста) |
| calcImplant(params), calcInstallment(sum, months), getImplantTariffs() | считаются локально (`lib/calc.ts`) | тарифы из прайса |
| getAdminAppointments(filters), updateAppointmentStatus(id, status), getTaxRequests() | админка | МИС / своя база |

Слоты в демке генерирует `lib/slots.ts` из расписания врачей (детерминированно от даты). Даты — во времени клиники (Asia/Yekaterinburg), `lib/dates.ts`. Тексты для клиентских компонентов (противопоказания, cookie, версия согласий) — `lib/staticTexts.ts`.

## Что сделать в бою
1. Интеграция с МИС: слоты, запись, перенос/отмена. Резерв — своя база слотов.
2. Уведомления: новая запись → администратору; напоминания пациенту, подтверждение ответом.
3. Кабинет: вход по SMS, сессии, данные из МИС.
4. Оплата этапов плана, чеки.
5. Заявки на справки для вычета → очередь администратора.
6. **ПДн граждан РФ хранить на серверах в РФ (152-ФЗ ст. 18 ч. 5)**; логировать согласия: кто, когда, версия текста (`consents.version`).
7. Аналитика: цели на запись, источник (`source`), без данных о здоровье в счётчиках.
