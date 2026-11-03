import Link from "next/link";
import { getBranches, getClinic } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { footerLegalNav, mainNav } from "@/lib/nav";
import { Contraindications } from "@/components/ui/Contraindications";
import { Logo } from "@/components/ui/Logo";
import styles from "./Footer.module.css";

/** Подвал на всех страницах: реквизиты, лицензия, документы, предупреждение, пометка «демо». */
export async function Footer() {
  const [clinic, branches] = await Promise.all([getClinic(), getBranches()]);
  const { license } = clinic;
  const sections = mainNav.flatMap((item) => [item, ...(item.children ?? [])]);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.panel}>
          <span className={styles.watermark} aria-hidden>
            {clinic.shortName}
          </span>

          <div className={styles.grid}>
            <section aria-labelledby="footer-contacts" className={styles.contacts}>
              <h2 id="footer-contacts" className="visually-hidden">
                {clinic.name}
              </h2>
              <Logo name={clinic.shortName} tone="light" />
              <a href={clinic.phoneHref} className={styles.phone}>
                {clinic.phone}
              </a>
              <p className={styles.muted}>
                {clinic.hours.weekdays}
                <br />
                {clinic.hours.weekend}
                <br />
                {clinic.email}
              </p>
            </section>

            <section aria-labelledby="footer-branches">
              <h2 id="footer-branches" className={styles.heading}>
                Филиалы
              </h2>
              <ul className={styles.list}>
                {branches.map((b) => (
                  <li key={b.id} className={styles.branch}>
                    <span className={styles.branchName}>«{b.name}»</span>
                    {b.address}
                  </li>
                ))}
              </ul>
            </section>

            <nav aria-labelledby="footer-nav">
              <h2 id="footer-nav" className={styles.heading}>
                Разделы
              </h2>
              <ul className={styles.list}>
                {sections.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label === "Пациентам" ? "О клинике" : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-legal">
              <h2 id="footer-legal" className={styles.heading}>
                Документы
              </h2>
              <ul className={styles.list}>
                {footerLegalNav.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={styles.legal}>
            <Contraindications variant="inline" tone="onBlue" className={styles.note} />
            <p>
              {clinic.legalName} ({clinic.legalNameShort}), ИНН {clinic.inn}, ОГРН {clinic.ogrn}. {clinic.legalAddress}.
            </p>
            <p>
              Лицензия на осуществление медицинской деятельности № {license.number} от {formatDate(license.date)},
              выдана: {license.issuer}.{" "}
              <Link href="/o-klinike/" className={styles.inlineLink}>
                Сведения о медицинской организации
              </Link>
              .
            </p>
            <p className={styles.demo}>{clinic.demoNote}.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
