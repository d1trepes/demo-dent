import type { ReactNode } from "react";
import type { AboutContent, Branch, Clinic, ClinicInfoField } from "@/lib/types";
import { fill, formatDate } from "@/lib/format";
import styles from "./ClinicInfo.module.css";

type Props = { clinic: Clinic; branches: Branch[]; texts: AboutContent["info"] };

/** Сведения о медорганизации (118н): строки «подпись — значение» в белой карточке. */
export function ClinicInfo({ clinic, branches, texts }: Props) {
  const { license } = clinic;
  const rows: [ClinicInfoField, ReactNode][] = [
    ["fullName", clinic.legalName],
    ["shortName", clinic.legalNameShort],
    ["ogrn", clinic.ogrn],
    ["inn", clinic.inn],
    ["kpp", clinic.kpp],
    ["legalAddress", clinic.legalAddress],
    ["director", clinic.director],
    [
      "branches",
      <ul key="b" className={styles.list}>
        {branches.map((b) => (
          <li key={b.id}>
            {texts.branchPrefix} «{b.name}» — {b.address}. {b.hours.weekdays}, {b.hours.weekend}
          </li>
        ))}
      </ul>,
    ],
    ["phone", <a key="p" href={clinic.phoneHref}>{clinic.phone}</a>],
    ["email", <a key="e" href={`mailto:${clinic.email}`}>{clinic.email}</a>],
    [
      "license",
      <>
        {fill(texts.licenseTemplate, { number: license.number, date: formatDate(license.date), issuer: license.issuer })}{" "}
        <a href={license.registryUrl} target="_blank" rel="noopener noreferrer">
          {texts.registryLink}
        </a>
      </>,
    ],
    [
      "works",
      <ul key="w" className={styles.list}>
        {clinic.licensedWorks.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>,
    ],
    [
      "authorities",
      <ul key="a" className={styles.list}>
        {clinic.authorities.map((a) => (
          <li key={a.name}>
            <a href={a.site} target="_blank" rel="noopener noreferrer">
              {a.name}
            </a>
            <span className={styles.muted}>{a.role}</span>
          </li>
        ))}
      </ul>,
    ],
  ];

  return (
    <dl className={styles.card}>
      {rows.map(([field, value]) => (
        <div key={field} className={styles.row}>
          <dt className={styles.label}>{texts.labels[field]}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
