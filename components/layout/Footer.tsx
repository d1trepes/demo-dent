import Link from "next/link";
import { getBranches, getClinic } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { footerLegalNav, mainNav } from "@/lib/nav";
import { Contraindications } from "@/components/ui/Contraindications";
import styles from "./Footer.module.css";

/** Подвал на всех страницах: реквизиты, лицензия, документы, предупреждение, пометка «демо». */
export async function Footer() {
  const [clinic, branches] = await Promise.all([getClinic(), getBranches()]);
  const { license } = clinic;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <section aria-labelledby="footer-contacts">
          <h2 id="footer-contacts" className={styles.heading}>
            {clinic.name}
          </h2>
          <p>
            <a href={clinic.phoneHref}>{clinic.phone}</a>
            <br />
            {clinic.email}
          </p>
          <p>
            {clinic.hours.weekdays}
            <br />
            {clinic.hours.weekend}
          </p>
          <ul className={styles.list}>
            {branches.map((b) => (
              <li key={b.id}>
                Филиал «{b.name}»: {b.address}
              </li>
            ))}
          </ul>
        </section>

        <nav aria-labelledby="footer-nav">
          <h2 id="footer-nav" className={styles.heading}>
            Разделы
          </h2>
          <ul className={styles.list}>
            {mainNav.flatMap((item) => [item, ...(item.children ?? [])]).map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href}>{link.label === "Пациентам" ? "О клинике" : link.label}</Link>
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
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={`container ${styles.legal}`}>
        <p>
          {clinic.legalName} ({clinic.legalNameShort}), ИНН {clinic.inn}, ОГРН {clinic.ogrn}. {clinic.legalAddress}.
        </p>
        <p>
          Лицензия на осуществление медицинской деятельности № {license.number} от {formatDate(license.date)}, выдана:{" "}
          {license.issuer}. <Link href="/o-klinike/">Сведения о медицинской организации</Link>.
        </p>
        <Contraindications />
        <p className={styles.demo}>{clinic.demoNote}.</p>
      </div>
    </footer>
  );
}
