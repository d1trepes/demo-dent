import Link from "next/link";
import { getClinic } from "@/lib/api";
import { bookingHref, loginHref, mainNav } from "@/lib/nav";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

export async function Header() {
  const clinic = await getClinic();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.shell}`}>
        <div className={styles.row}>
          <Link href="/" className={styles.logo} aria-label={`${clinic.name} — на главную`}>
            <Logo name={clinic.shortName} />
          </Link>

          <nav aria-label="Основное меню" className={styles.nav}>
            <ul className={styles.navList}>
              {mainNav.map((item) =>
                item.children ? (
                  <li key={item.href}>
                    <details className={styles.dropdown}>
                      <summary className={styles.navLink}>{item.label}</summary>
                      <ul className={styles.dropdownList}>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link href={child.href} className={styles.navLink}>
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.navLink}>
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className={styles.actions}>
            <a href={clinic.phoneHref} className={styles.phone}>
              {clinic.phone}
            </a>
            <Link href={loginHref} className={styles.login}>
              Войти
            </Link>
            <ButtonLink href={bookingHref} arrow className={styles.cta}>
              Записаться
            </ButtonLink>
            <MobileMenu nav={mainNav} phone={clinic.phone} phoneHref={clinic.phoneHref} hours={clinic.hours} />
          </div>
        </div>
      </div>
    </header>
  );
}
