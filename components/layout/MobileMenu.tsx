"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { bookingHref, loginHref, type NavItem } from "@/lib/nav";
import type { WorkHours } from "@/lib/types";
import styles from "./MobileMenu.module.css";

type Props = {
  nav: NavItem[];
  phone: string;
  phoneHref: string;
  hours: WorkHours;
};

export function MobileMenu({ nav, phone, phoneHref, hours }: Props) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();

  // Закрываем меню при переходе на другую страницу
  if (open && openedAt !== null && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggle = () => {
    setOpenedAt(pathname);
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        onClick={toggle}
      >
        {open ? <X aria-hidden size={24} /> : <Menu aria-hidden size={24} />}
      </button>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <nav aria-label="Мобильное меню">
          <ul className={styles.list}>
            {nav.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className={styles.link}
                      aria-expanded={group === item.href}
                      onClick={() => setGroup((g) => (g === item.href ? null : item.href))}
                    >
                      {item.label}
                      <ChevronDown aria-hidden size={22} className={styles.chevron} />
                    </button>
                    <ul className={styles.sublist} hidden={group !== item.href}>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className={styles.link}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link href={loginHref} className={styles.link}>
                Войти в кабинет
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles.contacts}>
          <a href={phoneHref} className={styles.link}>
            {phone}
          </a>
          <p>
            {hours.weekdays}
            <br />
            {hours.weekend}
          </p>
          <Link href={bookingHref} className={styles.cta}>
            Записаться
          </Link>
          <a href={phoneHref} className={styles.call}>
            Позвонить
          </a>
        </div>
      </div>
    </>
  );
}
