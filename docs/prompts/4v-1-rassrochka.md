# Образец промпта для Sonnet (утверждён дизайнером): чат 4В-1, /rassrochka/

Формат держим для всех следующих промптов: «Проект… Задача… Прочитай… Жёсткие правила… 1. Данные 2. Компоненты 3. Сетка с точными значениями 4. page.tsx 5. Мастер/прочее 6. В конце». Все размеры и тексты — из утверждённого макета в docs/mockups/, ничего не оставлять «на усмотрение».

---

Проект: демо-сайт стоматологии «Ясень» (репозиторий d1trepes/demo-dent, Next.js static export). Чат 4В-1.

Задача: сделать страницу /rassrochka/ строго по утверждённому макету docs/mockups/rassrochka.html (открой его целиком, это источник размеров, отступов и текстов) и научить мастер записи принимать сумму и срок рассрочки из адреса. Сейчас /rassrochka/ — заглушка PageStub.

Прочитай (фрагментами, без пересказа): docs/DESIGN.md целиком; docs/PROGRESS.md («Сейчас», последние 5 строк журнала); docs/mockups/rassrochka.html; components/home/Manifesto.tsx + .module.css; components/home/PlanBranch.tsx + .module.css; components/home/Callback.tsx, CallbackForm.tsx, Callback.module.css; components/ui/Button.tsx, TextField.tsx, ConsentCheckbox.tsx; lib/calc.ts (функция installment); lib/api.ts (образец: getPricesContent, getImplantTariffs); lib/types.ts (InstallmentTerms, HomeManifesto, HomePlan, HomeCallback, BookingData); app/ceny/page.tsx и .page в components/prices/PricesView.module.css (отступ страницы); components/booking/init.ts, Summary.tsx, BookingDone.tsx, store/bookingStore.ts; data/booking.json (source, done, summary); data/services.json (installment).

Жёсткие правила:
- Предупреждение о противопоказаниях на странице НЕ ставим: оно только в подвале (решение дизайнера). Плашек <Contraindications /> нет.
- Никаких надзаголовков, пилюль-меток поверх фото, иконок и стрелок в кнопках, эмодзи, градиентов, галочек в кружках. Кнопки 56 px, пилюли, как на сайте.
- Все числа и тексты — из JSON (/data) и типов в lib/types.ts. Срок (6, 12), минимум и максимум суммы — только из data/services.json → installment, не дублируем в компонентах.
- Серверные данные только через lib/api.ts; в клиентских компонентах lib/api.ts не импортировать (только import() по действию). Расчёт платежа — чистая функция installment() из lib/calc.ts, термы передаём пропсами со страницы.
- Фото не генерируем: используем уже лежащие в public/images (пути ниже).
- Страницу делаем под десктоп, но брейкпоинты из макета (≤1100 и ≤720) переносим, чтобы чат 8 свёлся к правкам.
- Без any, без неиспользуемого кода, правки точечные, существующие файлы не переписывать целиком.
- Без скриншотов, Lighthouse и проверок в браузере. Вопросы — только если без них результат будет мимо; сомнения одной строкой в «Открытые вопросы» PROGRESS.md.

1. Данные
Новый data/rassrochka.json и тип RassrochkaContent в lib/types.ts, геттер getRassrochkaContent() в lib/api.ts (по образцу getPricesContent). Также геттер getInstallmentTerms() → services.json installment. Поля:
- metaTitle «Рассрочка»; title «Рассрочка без переплаты»; lead «Стоимость лечения делится на 6 или 12 равных платежей. Проценты не начисляются, банк не нужен.»
- facts (4): «Срок» → «{months} месяцев» (months из термов через « или »); «Проценты и комиссии» → «Нет»; «Сумма лечения» → «От {min} до {max} ₽» (min/max из термов, формат 20 000); «Оформление» → «В клинике, без банка».
- calc: sumLabel «Сумма лечения», sumSuffix «₽», rangeLabel «Сумма лечения, ползунок», termsLabel «Срок рассрочки», term «{n} месяцев», payLabel «Платёж в месяц», totalLabel «Всего к оплате», book {label «Записаться на консультацию»}, callback {label «Перезвоните мне», href «#callback»}.
- manifesto: segments как у HomeManifesto — text «Как оформить рассрочку:», pill /images/manifest/manifest-consult.webp (800×400, alt ""), text «договор в клинике по паспорту», pill /images/manifest/manifest-contract.webp (800×400, alt ""), text «без банка и справок о доходах».
- plan.steps (ровно 4, number «01»..«04»): 01 «План лечения» / 02 «Срок и платёж» / 03 «Договор» / 04 «Платежи по графику», тексты и листья (plan-02-plan, manifest-consult, manifest-contract, plan-04-control) — как в макете.
- callback: title «Перезвоним и посчитаем», subtitle «Администратор перезвонит в рабочее время, посчитает платёж и подберёт время приёма», sourceLabel «Рассрочка — «Перезвоните мне»». Остальные тексты формы и фото врача — из home.json → callback.
В data/booking.json добавь: source.installment «Рассрочка: {sum} ₽ на {months} мес.»; строку сводки «Рассрочка» со значением «{sum} ₽ на {months} мес., {monthly} ₽ в месяц»; в done — installmentNote «График платежей покажет администратор на консультации».

2. Компоненты (components/rassrochka/*, CSS Modules)
- InstallmentHero (server): синяя плашка + слева h1, lead, facts; справа <InstallmentCalculator />.
- InstallmentCalculator («use client»): sum (по умолчанию 120000), months (по умолчанию 12); начальные значения из ?sum= и ?months= (только допустимые; sum округлить до 1000), читать после монтирования. Поле суммы: text, inputMode numeric, на blur зажимать в [minSum, maxSum] и форматировать «120 000»; ползунок step 1000, синхронно. Срок — две кнопки-пилюли (aria-pressed). Результат: installment(sum, months, terms), aria-live="polite". Primary → /zapis/?service=diagnostika&sum={sum}&months={months}; secondary «Перезвоните мне» → #callback.
- Заголовок-манифест: переиспользовать <Manifesto> как есть (эффект «перелива» слов уже в Manifesto.module.css).
- Ветка листьев: переиспользовать <PlanBranch>; добавить необязательный проп compact (отступ сверху 56 вместо 120 на десктопе, 48 на мобильном).
- Блок заявки: из Callback.tsx вынести переиспользуемую CallbackCard (title, subtitle, texts формы, photo, source); Callback главной остаётся прежним. В CallbackForm проп source ({page, label}), по умолчанию — значение главной. Обёртка id="callback", scroll-margin-top 120, margin-top 56.

3. Сетка и размеры (как в макете)
- Внешняя обёртка: padding-top 32 (на обёртке, не на .container).
- Hero-плашка: --color-primary, radius --radius-panel (36), padding 64, 12 колонок, column-gap 24, align-items center; текст — колонки 1–6, калькулятор — 8–12.
- h1 Prata var(--display-2) белый; lead 20/1.45 rgb(255 255 255 / .85), max-width 520, margin-top 16; facts: 2 колонки, margin-top 40, ячейка padding 16 0 18 + border-top 1px rgb(255 255 255 / .25), подпись 13 / значение 18/500.
- Карточка калькулятора: surface, radius 28, padding 12, gap 16; поле суммы 56 px, пилюля, фон --color-bg, 22/500; срок — пилюли 44 px; результат radius 18, фон --color-bg, «Платёж в месяц» 34 px кобальт; кнопки flex gap 8.
- Ниже hero margin-top 96; манифест Prata 48/1.25 по центру, max-width 1040; далее ветка (compact) и заявка (margin-top 56).
- ≤1100: hero в одну колонку (padding 32 20, radius 28, gap 32); ≤720: кнопки в столбец, facts в одну колонку.

4. app/rassrochka/page.tsx — server component по образцу app/ceny/page.tsx; PageStub убрать.

5. Мастер записи (точечные правки)
- BookingData получает installment (InstallmentTerms).
- init.ts: если в адресе валидные sum и months — installment {sum, months, monthly} в черновик, source.label из content.source.installment приоритетнее прочих; остальное поведение не менять.
- Summary: строка «Рассрочка» только если installment задан. BookingDone: installmentNote только в этом случае.

6. В конце
- docs/DESIGN.md: решения — hero-плашка /rassrochka/ синяя по сетке с калькулятором; заголовок-манифест и ветка листьев разрешены на внутренних страницах с шагами; «Перезвоните мне» переиспользуется через CallbackCard.
- docs/PROGRESS.md: строка 4В-1 → готово; 2–4 строки в журнал; в «Открытые вопросы»: вход в рассрочку из прайса и страниц услуг (?sum=) отложен на чат 8.
- npm run build без ошибок → коммит «chat-4v-1: страница рассрочки, рассрочка в мастере записи» → push.
- Отчёт 3–5 строк: что сделано, что проверить руками (ссылки), следующий шаг.
