import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { fill, formatYears } from "@/lib/format";
import type { CSSProperties } from "react";
import type { Doctor, ServiceDetails, ServicePageTexts } from "@/lib/types";
import styles from "./ServiceDoctors.module.css";

type Props = { service: ServiceDetails; texts: ServicePageTexts };

function DoctorCard({ doctor, service, texts, year }: Props & { doctor: Doctor; year: number }) {
  const branchNames = doctor.branches
    .map((id) => service.branches.find((b) => b.id === id)?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => `«${name}»`)
    .join(", ");

  return (
    <article className={styles.card}>
      <Link href={`/vrachi/${doctor.slug}/`} className={styles.photo} tabIndex={-1} aria-hidden>
        <img src={asset(doctor.photo)} width={720} height={960} alt="" loading="lazy" decoding="async" />
      </Link>

      <div className={styles.body}>
        <div>
          <h3 className={styles.name}>
            <Link href={`/vrachi/${doctor.slug}/`}>{doctor.fullName}</Link>
          </h3>
          <p className={styles.position}>{doctor.position}</p>
        </div>

        <div className={styles.foot}>
          <p className={styles.exp}>
            <b>{fill(texts.experience, { years: formatYears(year - doctor.experienceSince) })}</b>
            {branchNames}
          </p>
          <Link href={`/zapis/?doctor=${doctor.slug}`} className={styles.pill}>
            {texts.bookDoctor}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** «Врачи направления»: слева заголовок и факт, справа карточки шириной в четверть сетки (1–3 врача). */
export function ServiceDoctors(props: Props) {
  const { service, texts } = props;
  const { doctors, page } = service;
  const year = new Date().getFullYear();

  return (
    <section
      id="doctors"
      className={styles.section}
      style={{ "--n": doctors.length } as CSSProperties}
      aria-labelledby="doctors-title"
    >
      <div className={styles.head}>
        <h2 id="doctors-title" className={styles.title}>
          {texts.doctorsTitle}
        </h2>
        <p className={styles.note}>{page.doctorsNote}</p>
        <ButtonLink href="/vrachi/" variant="secondary" className={styles.all}>
          {texts.allDoctors}
        </ButtonLink>
      </div>

      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} year={year} {...props} />
      ))}
    </section>
  );
}
