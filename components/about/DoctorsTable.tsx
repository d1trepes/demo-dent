import Link from "next/link";
import type { Branch, Doctor, DoctorsTableTexts } from "@/lib/types";
import { formatDate, scheduleByBranch } from "@/lib/format";
import styles from "./DoctorsTable.module.css";

type Props = { doctors: Doctor[]; branches: Branch[]; texts: DoctorsTableTexts };

/** Сводная таблица врачей (118н): ФИО, специальность, образование, сертификат/аккредитация, филиал, график. */
export function DoctorsTable({ doctors, branches, texts }: Props) {
  const { columns } = texts;
  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id;
  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">{columns.name}</th>
            <th scope="col">{columns.specialty}</th>
            <th scope="col">{columns.education}</th>
            <th scope="col">{columns.certification}</th>
            <th scope="col">{columns.branch}</th>
            <th scope="col">{columns.schedule}</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d.id}>
              <th scope="row" className={styles.name}>
                <Link href={`/vrachi/${d.slug}/`}>{d.fullName}</Link>
              </th>
              <td>{d.position}</td>
              <td>
                {d.education.map((e) => (
                  <p key={`${e.year}-${e.qualification}`} className={styles.line}>
                    {e.institution}, {e.year}
                    <span className={styles.muted}>{e.qualification}</span>
                  </p>
                ))}
              </td>
              <td>
                {d.certifications.map((c) => (
                  <p key={c.number} className={styles.line}>
                    {c.kind === "accreditation" ? texts.accreditation : texts.certificate} № {c.number}
                    <span className={styles.muted}>
                      {c.specialty}, {texts.validUntil} {formatDate(c.validUntil)}
                    </span>
                  </p>
                ))}
              </td>
              <td>{d.branches.map(branchName).join(", ")}</td>
              <td>
                {scheduleByBranch(d.schedule, texts.weekdays).map((s) => (
                  <p key={s.branchId} className={styles.line}>
                    {d.branches.length > 1 && <span className={styles.muted}>{branchName(s.branchId)}</span>}
                    {s.text}
                  </p>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
