# Промпт для Sonnet: чат 4В-3, шаблон /uslugi/[slug]/

Формат — как docs/prompts/4v-1-rassrochka.md. Все размеры и тексты — из утверждённого макета docs/mockups/usluga.html.

---

Проект: демо-сайт стоматологии «Ясень» (репозиторий d1trepes/demo-dent, Next.js static export). Чат 4В-3.

Задача: сделать шаблон страницы услуги /uslugi/[slug]/ (8 страниц из data/servicePages.json) строго по утверждённому макету docs/mockups/usluga.html (пример — «Имплантация»; открой его целиком, это источник размеров, отступов и текстов). Сейчас app/uslugi/[slug]/page.tsx — заглушка PageStub.

Прочитай (фрагментами, без пересказа): docs/DESIGN.md — разделы «Решения, которые меняют паспорт», «Цены», «Услуги», «Рассрочка», «Решения дизайнера для внутренних страниц», «Страница услуги»; docs/PROGRESS.md («Сейчас», последние 5 строк журнала); docs/mockups/usluga.html; components/home/PlanBranch.tsx + .module.css; components/home/Manifesto.tsx + .module.css; components/home/CallbackCard.tsx; components/rassrochka/RassrochkaView.tsx (образец сборки Manifesto + PlanBranch compact + CallbackCard); components/prices/PriceRow.tsx + .module.css (вид строки и «Бесплатно»); components/services/ServicesAside.module.css (белая липкая плашка); lib/api.ts (getService, getServiceSlugs); lib/types.ts (ServicePage, Step, Faq, PlanBranchStep, PlanContent, HomeManifesto, ManifestoSegment, Picture, ServiceDetails, Doctor); lib/format.ts (formatPrice, formatYears); data/servicePages.json; data/home.json → callback.

Жёсткие правила:
- Плашек <Contraindications /> нет: предупреждение только в подвале. FAQ нет нигде, итогового призыва нет.
- Prata — только h1, заголовок-манифест и заголовки секций «Врачи направления» и «Перезвоним…». Заголовки внутри карточек («Кому подходит», «Цены») — Golos 24/500.
- Никаких надзаголовков, пилюль-меток поверх фото, иконок и стрелок в кнопках, эмодзи, градиентов. Кнопки 56 px, малые пилюли 44 px.
- Все тексты, id и пути — из JSON (/data) и типов в lib/types.ts; цены, длительности и названия позиций — только из services.json по id, не дублировать.
- Серверные данные только через lib/api.ts. Фото не генерировать: только файлы из public/images (список ниже). Нет файла — серая заглушка с подписью из поля shot.
- Десктоп, но брейкпоинты макета (≤1199 для ветки, ≤1100, ≤1023, ≤720) перенести.
- Без any, без неиспользуемого кода, правки точечные. Без скриншотов, Lighthouse и проверок в браузере. Сомнения — одной строкой в «Открытые вопросы» PROGRESS.md.

1. Данные (data/servicePages.json + lib/types.ts)
- Удалить faq у всех 8 страниц и тип Faq, поле faq из ServicePage.
- steps: каждому шагу добавить leaf: Picture (640×640, alt "") и shot: string (подпись заглушки, пока фото нет). Номер шага не хранить — PlanBranch считает «01», «02»… по индексу.
- Новые поля ServicePage: priceLabel, buyNote?, priceItemIds (string[]), manifesto (HomeManifesto), doctorsNote, callback {title, subtitle, sourceLabel}.
- Фото листьев (public/images/…): есть — steps/lechenie-kariesa-01, -03, -04; steps/lechenie-kanalov-02, -03, -04; steps/profgigiena-01…04; steps/implantaciya-03, -04, -05; steps/protezirovanie-01…04; steps/ortodontiya-01, -03, -04. Готовые из manifest/: lechenie-kariesa-02 и ortodontiya-02 → manifest/plan-02-plan.webp; lechenie-kanalov-01 и udalenie-01 → manifest/plan-01-scan.webp; implantaciya-01 → plan-01-scan, implantaciya-02 → plan-02-plan. Пока нет (leaf.src "", shot заполнить по промптам из docs/PHOTO_PROMPTS.md, раздел «Страницы услуг», одной фразой по-русски): ortodontiya-05, detskaya-01…03, udalenie-02…04 — будут steps/<slug>-0N.webp.
- priceItemIds: lechenie-kariesa — d-01, k-01, k-02, k-03, k-05, k-06; lechenie-kanalov — d-01, c-01, c-02, c-03, c-04, c-06; profgigiena — g-01, g-02, g-03, g-04, g-05, g-07; implantaciya — d-02, i-01, i-02, i-03, i-04, i-08; protezirovanie — p-01, p-02, p-03, p-04, p-06, p-08; ortodontiya — o-01, o-02, o-03, o-04, o-05, o-06; detskaya — ch-01, ch-02, ch-03, ch-04, ch-05, ch-06; udalenie — d-02, u-01, u-02, u-03, u-04, u-05.
- priceLabel: implantaciya «Цена под ключ», остальные «Цена». buyNote только у implantaciya: «Итоговую сумму называет хирург после КТ, до начала лечения».
- manifesto (сегменты: текст · таблетка · текст · таблетка · текст; таблетки — leaf первого и последнего шага страницы, alt ""):
  lechenie-kariesa «Четыре этапа» · «от снимка до полировки» · «обычно за один визит»;
  lechenie-kanalov «Четыре этапа» · «от снимка до восстановления зуба» · «за 1–3 визита»;
  profgigiena «Четыре этапа» · «от осмотра до фторирования» · «за один визит около часа»;
  implantaciya «Пять этапов» · «от консультации с КТ до постоянной коронки» · «за 3–8 месяцев»;
  protezirovanie «Четыре этапа» · «от консультации до фиксации» · «за 2–4 визита»;
  ortodontiya «Пять этапов» · «от диагностики до ретейнера» · «обычно за 12–24 месяца»;
  detskaya «Три этапа» · «от знакомства до лечения» · «первый визит — 30 минут»;
  udalenie «Четыре этапа» · «от снимка до памятки» · «за 30–90 минут».
- doctorsNote: lechenie-kariesa «Три терапевта, приём в обоих филиалах»; lechenie-kanalov «Каналы лечат под микроскопом. Три терапевта, приём в обоих филиалах»; profgigiena «Гигиенист принимает в обоих филиалах»; implantaciya «Имплантацию проводят два хирурга. Консультация с КТ — в филиале «Центр», где стоит томограф»; protezirovanie «Два ортопеда, приём в обоих филиалах. Коронки делает лаборатория клиники в «Центре»»; ortodontiya «Ортодонт принимает в обоих филиалах»; detskaya «Два детских стоматолога, приём в филиале «Академический»»; udalenie «Два хирурга. КТ перед удалением делают в филиале «Центр»».
- callback.title у всех «Перезвоним и запишем на консультацию»; subtitle «Администратор перезвонит в рабочее время и подберёт время у {кого}»: терапевта (кариес, каналы), гигиениста, хирурга-имплантолога + «. Консультация с КТ бесплатная» (имплантация), ортопеда, ортодонта, детского стоматолога, хирурга (удаление); sourceLabel «{title страницы} — «Перезвоните мне»».
- Общие тексты шаблона (forTitle «Кому подходит», durationLabel «Сколько длится лечение», pricesTitle «Цены», count «{n} {word}», allPrices «Весь прайс по направлению», book «Записаться на консультацию», free «Бесплатно», from «от», toc-подписи, doctorsTitle «Врачи направления», allDoctors «Все врачи», experience «Стаж {years}», bookDoctor «Записаться») — data/servicePage.json + тип ServicePageTexts + геттер getServicePageTexts() по образцу getPricesContent.
- getService() дополнить: items по priceItemIds в их порядке (вместо всех позиций направления); branches для названий филиалов врачей.

2. Компоненты (components/service/*, CSS Modules)
- PlanBranch (точечно): ROW_H из 4 фиксированных строк → N строк по 300 px по steps.length (геометрию линии и черенков не менять, срез slice(0, 4) убрать); номер «0N» по индексу, если в шаге нет number; leaf.src "" → серый лист --color-placeholder с подписью shot 12/1.35 muted по центру, padding 44. PlanBranchStep.number сделать необязательным; главная и /rassrochka/ не должны измениться.
- Manifesto (точечно): таблетка с пустым src → пустая серая пилюля.
- ServiceAside: липкая белая карточка (top 104, radius 28, поле 12, gap 12): блок цены на --color-bg (radius 18, поля 18/20/20) — priceLabel 13 muted, «от» 15 muted + сумма 28/500 кобальт (direction.priceFrom, «от» по наличию у позиции-минимума — как в lib/servicesIndex.ts), buyNote 14 muted margin-top 8; основная кнопка на всю ширину → /zapis/?service={slug}; якоря #for, #price, #steps, #doctors — строки 52 px, поля 12/20, radius 18, hover --color-bg + кобальт.
- ServiceIntro (id="for"): белая карточка, сетка 1fr 1fr, column-gap 48; фото /images/directions/{slug}.webp без aspect-ratio, min-height 280, radius 18, object-fit cover; справа (padding 24 16 4 0, grid space-between, gap 24) — h2 Golos 24/500, список forWhom: строки 17/1.4, padding 12 0, линии 1px --color-line сверху и снизу последней; внизу плашка --color-bg radius 18, поля 16/20, margin-left −4: dt 13 muted, dd 18/500.
- ServicePrices (id="price"): белая карточка, поля 32/12/12; шапка padding 0 12 16 24: h2 Golos 24/500 + «N услуг» 15 muted, справа пилюля-обводка 44 «Весь прайс по направлению» → /ceny/?direction={slug}. Строки — ссылки на /zapis/?service={id позиции}, вид как PriceRow (68 px, поля 14/24, radius 18, разделители 1px с отступом 24, hover --color-tint + кобальт); название позиции до двоеточия, хвост после двоеточия — подстрокой 14 muted вместе с длительностью через « · », иначе только «N мин»; цена 18/500 tabular, «от» 14 muted; 0 ₽ → пилюля «Бесплатно» (tint/кобальт, на hover заливка). Ниже priceNote: плашка --color-bg, radius 18, поля 16/24, 15 muted, margin-top 12.
- ServiceDoctors (id="doctors"): сетка minmax(0,1fr) + N × calc((100% − 72px)/4), column-gap 24 (N = число врачей, 1–3); слева h2 Prata 48, doctorsNote 17/1.55 muted max-width 400, вторичная кнопка «Все врачи» → /vrachi/ (margin-top 16). Карточка: белая, radius 28, поле 12, gap 20; фото 3:4 radius 18 object-position top (ссылка на /vrachi/{slug}/, hover scale 1.04 за 0.8 с); тело padding 0 12 8, gap 20: ФИО 20/500 (ссылка, hover кобальт), должность 15 muted; низ — «Стаж N лет» 17/500 + филиалы 15 muted слева, пилюля 44 «Записаться» → /zapis/?doctor={slug} справа (hover — заливка кобальтом).
- ServiceView: шапка (h1 Prata, lead 20 muted max 680) → грид 312px + 1fr, gap 40, margin-top 40 (слева ServiceAside, справа ServiceIntro и ServicePrices, gap 24) → секция id="steps" margin-top 160: Manifesto + PlanBranch compact → ServiceDoctors margin-top 160 → CallbackCard margin-top 160 (content = home.callback с title/subtitle страницы, source {page: "/uslugi/{slug}/", label: sourceLabel}). Отступ страницы 32/16/40, padding-top на внешней обёртке. scroll-margin-top 112 у якорей.
- ≤1100: грид в одну колонку, плашка не липкая, якоря скрыть, Intro в одну колонку; врачи — 2 колонки, заголовок на всю ширину; отступы секций 96. ≤1023: Prata заголовков 32. ≤720: строки цен — название над ценой; врачи в одну колонку.

3. app/uslugi/[slug]/page.tsx — server component: getService, getServicePageTexts, getHomeContent (callback); PageStub убрать; generateStaticParams и metadata оставить.

4. В конце
- docs/DESIGN.md: «Страница услуги» — отметить «сделано (4В-3)»; PlanBranch теперь на N шагов.
- docs/PROGRESS.md: строка 4В-3 → готово; 2–3 строки в журнал; в «Открытые вопросы»: 7 фото листьев ещё нет (ortodontiya-05, detskaya-01…03, udalenie-02…04).
- npm run build без ошибок → коммит «chat-4v-3: шаблон страницы услуги» → push.
- Отчёт 3–5 строк: что сделано, что проверить руками (/uslugi/implantaciya/, /uslugi/detskaya/), следующий шаг.
