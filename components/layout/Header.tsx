import Link from "next/link";
import { getClinic } from "@/lib/api";
import { bookingHref, loginHref, mainNav } from "@/lib/nav";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import styles from "./Header.module.css";

/** Шапка: на десктопе — одна белая плашка шириной с синюю панель hero: логотип, меню по центру, «Войти» и «Записаться». */
export async function Header() {
  const clinic = await getClinic();

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
        <Link href="/" className={styles.logo} aria-label={`${clinic.name} — на главную`}>
          <Logo name={clinic.shortName} />
        </Link>

        <nav aria-label="Основное меню" className={styles.nav}>
          <ul className={styles.navList}>
            {mainNav.map((item) =>
              item.children ? (
                <li key={item.href}>
                  {/* Открывается при наведении и фокусе с клавиатуры (CSS), закрывается, когда курсор уходит */}
                  <div className={styles.dropdown}>
                    <NavLink href={item.href} className={styles.navLink}>
                      {item.label}
                    </NavLink>
                    <ul className={styles.dropdownList}>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className={styles.navLink}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <NavLink href={item.href} className={styles.navLink}>
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ButtonLink href={loginHref} variant="secondary" className={styles.desktopOnly}>
            Войти
          </ButtonLink>
          <ButtonLink href={bookingHref} className={styles.desktopOnly}>
            Записаться
          </ButtonLink>
          <div className={styles.mobileOnly}>
            <MobileMenu nav={mainNav} phone={clinic.phone} phoneHref={clinic.phoneHref} hours={clinic.hours} />
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}
