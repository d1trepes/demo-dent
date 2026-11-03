import Link from "next/link";
import { getBranches, getClinic } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { footerLegalNav, footerNav } from "@/lib/nav";
import { Contraindications } from "@/components/ui/Contraindications";
import { Logo } from "@/components/ui/Logo";
import styles from "./Footer.module.css";

/**
 * Подвал на всех страницах (чат 2E, реф. ref-footer.png — только внутрянка): синяя плашка;
 * верхний ряд — логотип, телефон и 3 колонки простых ссылок; средний — 2 филиала;
 * нижний — реквизиты, лицензия, документы, предупреждение о противопоказаниях, пометка «демо».
 * Данные — clinic.json и branches.json через lib/api.ts, ссылки — lib/nav.ts.
 */
export async function Footer() {
  const [clinic, branches] = await Promise.all([getClinic(), getBranches()]);
  const { license } = clinic;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.panel}>
          <div className={styles.top}>
            <div className={styles.brand}>
              <Link href="/" className={styles.logoLink} aria-label={`${clinic.name} — на главную`}>
                <Logo name={clinic.shortName} tone="light" />
              </Link>
              <a href={clinic.phoneHref} className={styles.phone}>
                {clinic.phone}
              </a>
            </div>

            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title} className={styles.group}>
                <h2 className={styles.heading}>{group.title}</h2>
                <ul className={styles.list}>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link href={link.href} className={styles.link}>
                          {link.label}
                        </Link>
                      ) : (
                        <span className={styles.stub}>{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <section aria-label="Филиалы" className={styles.branches}>
            {branches.map((b) => (
              <div key={b.id} className={styles.branch}>
                <h2 className={styles.branchName}>«{b.name}»</h2>
                <p className={styles.muted}>{b.address}</p>
                <p className={styles.muted}>
                  {b.hours.weekdays}
                  <br />
                  {b.hours.weekend}
                </p>
                <Link href="/filialy/" className={styles.route}>
                  Как добраться
                </Link>
              </div>
            ))}
          </section>

          <div className={styles.legal}>
            <div className={styles.requisites}>
              <p>
                {clinic.legalName}, ИНН {clinic.inn}, ОГРН {clinic.ogrn}
              </p>
              <p>
                Лицензия № {license.number} от {formatDate(license.date)}, выдана: {license.issuer}
              </p>
            </div>
            <ul className={styles.legalLinks}>
              {footerLegalNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.legalLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.notes}>
              <Contraindications variant="inline" tone="onBlue" className={styles.note} />
              <p>{clinic.demoNote}</p>
              <p>© {new Date().getFullYear()} {clinic.legalNameShort}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
