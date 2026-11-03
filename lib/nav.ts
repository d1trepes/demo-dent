/** Меню сайта: одна структура для шапки, мобильного меню и подвала. */
export type NavLink = { href: string; label: string };
export type NavItem = NavLink & { children?: NavLink[] };

export const mainNav: NavItem[] = [
  { href: "/uslugi/", label: "Услуги" },
  { href: "/ceny/", label: "Цены" },
  { href: "/vrachi/", label: "Врачи" },
  { href: "/filialy/", label: "Филиалы" },
  {
    href: "/o-klinike/",
    label: "Пациентам",
    children: [
      { href: "/rassrochka/", label: "Рассрочка" },
      { href: "/vychet/", label: "Налоговый вычет" },
      { href: "/akcii/", label: "Акции" },
      { href: "/o-klinike/dokumenty/", label: "Документы" },
    ],
  },
];

export const bookingHref = "/zapis/";
export const loginHref = "/kabinet/vhod/";

/** Ссылка подвала: href — страница сайта; без href — заглушка мессенджера (в демке не ведёт наружу). */
export type FooterLink = { label: string; href?: string };
export type FooterGroup = { title: string; links: FooterLink[] };

/** Колонки подвала (2E): только страницы из карты сайта. Telegram и MAX — без ссылок, пока у клиники нет реальных адресов. */
export const footerNav: FooterGroup[] = [
  {
    title: "Пациентам",
    links: [
      { href: "/uslugi/", label: "Услуги" },
      { href: "/ceny/", label: "Цены" },
      { href: "/vrachi/", label: "Врачи" },
      { href: "/rassrochka/", label: "Рассрочка" },
      { href: "/vychet/", label: "Налоговый вычет" },
      { href: "/akcii/", label: "Акции" },
    ],
  },
  {
    title: "Клиника",
    links: [
      { href: "/o-klinike/", label: "О клинике" },
      { href: "/filialy/", label: "Филиалы" },
      { href: "/o-klinike/#svedeniya", label: "Сведения о медорганизации" },
      { href: "/o-klinike/dokumenty/", label: "Документы" },
    ],
  },
  {
    title: "Онлайн",
    links: [
      { href: bookingHref, label: "Записаться" },
      { href: loginHref, label: "Личный кабинет" },
      { label: "Telegram" },
      { label: "MAX" },
    ],
  },
];

/** Нижний ряд подвала: документы по 152-ФЗ. */
export const footerLegalNav: NavLink[] = [
  { href: "/privacy/", label: "Политика обработки данных" },
  { href: "/soglasie/", label: "Согласие на обработку ПДн" },
];
