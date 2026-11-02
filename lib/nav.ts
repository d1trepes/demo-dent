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

export const footerLegalNav: NavLink[] = [
  { href: "/o-klinike/", label: "Сведения о медицинской организации" },
  { href: "/o-klinike/dokumenty/", label: "Документы и лицензия" },
  { href: "/privacy/", label: "Политика обработки персональных данных" },
  { href: "/soglasie/", label: "Согласие на обработку персональных данных" },
  { href: "/soglasie-zdorovye/", label: "Согласие на обработку данных о здоровье" },
];
