import Link from "next/link";
import { InfoRows, type InfoRow } from "@/components/about/InfoRows";
import { CallbackCard } from "@/components/home/CallbackCard";
import { ButtonLink } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { fill, formatDate, formatYears } from "@/lib/format";
import type { Branch, Direction, Doctor, DoctorsPageContent, HomeCallback } from "@/lib/types";
import { DoctorSlots } from "./DoctorSlots";
import styles from "./DoctorProfile.module.css";

type Props = {
  doctor: Doctor;
  specialty: string;
  branches: Branch[];
  directions: Direction[];
  texts: DoctorsPageContent["profile"];
  callback: HomeCallback;
};

const clock = (time: string) => time.replace(/^0/, "");

/** /vrachi/[slug]/: фото и о враче → свободное время → квалификация (118н) → направления и график → «Перезвоните мне». */
export function DoctorProfile({ doctor, specialty, branches, directions, texts, callback }: Props) {
  const q = texts.qualification;
  const years = new Date().getFullYear() - doctor.experienceSince;
  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id;
  const ownDirections = directions.filter((d) => d.hasPage && doctor.directions.includes(d.id));

  const rows: InfoRow[] = [
    { key: "specialty", label: q.specialty, value: specialty },
    { key: "position", label: q.position, value: doctor.position },
    { key: "category", label: q.category, value: doctor.category ?? q.noCategory },
    {
      key: "education",
      label: q.education,
      value: (
        <ul className={styles.list}>
          {doctor.education.map((e) => (
            <li key={`${e.year}-${e.qualification}`}>
              {e.institution}, {e.year}
              <span className={styles.muted}>{e.qualification}</span>
            </li>
          ))}
        </ul>
      ),
    },
    ...doctor.certifications.map((c) => ({
      key: c.number,
      label: c.kind === "accreditation" ? q.accreditation : q.certificate,
      value: (
        <>
          {c.specialty}
          <span className={styles.muted}>
            {fill(q.certTemplate, { number: c.number, date: formatDate(c.date), until: formatDate(c.validUntil) })}
          </span>
        </>
      ),
    })),
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/vrachi/" className={styles.back}>
          {texts.back}
        </Link>

        <section className={styles.hero}>
          <div className={styles.photo}>
            <img src={asset(doctor.photo)} width={720} height={960} alt={doctor.fullName} decoding="async" />
          </div>
          <div className={styles.info}>
            <p className={styles.specialty}>{specialty}</p>
            <h1 className={styles.name}>{doctor.fullName}</h1>
            <p className={styles.meta}>
              {[doctor.position, doctor.category, fill(texts.experience, { years: formatYears(years) })]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <ul className={styles.pills}>
              {doctor.branches.map((id) => (
                <li key={id} className={styles.pill}>
                  «{branchName(id)}»
                </li>
              ))}
            </ul>
            <p className={styles.about}>{doctor.about}</p>
            <ButtonLink href={`/zapis/?doctor=${doctor.slug}`} className={styles.book}>
              {texts.book}
            </ButtonLink>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="slots-title">
          <div className={styles.card}>
            <h2 id="slots-title" className={styles.title}>
              {texts.slots.title}
            </h2>
            <p className={styles.lead}>{texts.slots.lead}</p>
            <div className={styles.slots}>
              <DoctorSlots doctorId={doctor.id} slug={doctor.slug} texts={texts.slots} />
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="qualification-title">
          <h2 id="qualification-title" className={styles.title}>
            {q.title}
          </h2>
          <p className={styles.lead}>{q.lead}</p>
          <div className={styles.rows}>
            <InfoRows rows={rows} />
          </div>
        </section>

        <div className={styles.split}>
          {ownDirections.length > 0 && (
            <section aria-labelledby="directions-title">
              <h2 id="directions-title" className={styles.title}>
                {texts.directionsTitle}
              </h2>
              <ul className={styles.links}>
                {ownDirections.map((d) => (
                  <li key={d.id}>
                    <Link href={`/uslugi/${d.id}/`} className={styles.link}>
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="schedule-title">
            <h2 id="schedule-title" className={styles.title}>
              {texts.schedule.title}
            </h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{texts.schedule.day}</th>
                  <th scope="col">{texts.schedule.hours}</th>
                  <th scope="col">{texts.schedule.branch}</th>
                </tr>
              </thead>
              <tbody>
                {texts.schedule.weekdays.map((day, i) => {
                  const shifts = doctor.schedule.filter((s) => s.weekday === i + 1);
                  if (shifts.length === 0) {
                    return (
                      <tr key={day} className={styles.off}>
                        <th scope="row">{day}</th>
                        <td colSpan={2}>{texts.schedule.dayOff}</td>
                      </tr>
                    );
                  }
                  return shifts.map((s, j) => (
                    <tr key={`${day}-${s.branchId}`}>
                      {j === 0 && (
                        <th scope="row" rowSpan={shifts.length}>
                          {day}
                        </th>
                      )}
                      <td>
                        {clock(s.start)}–{clock(s.end)}
                      </td>
                      <td>«{branchName(s.branchId)}»</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </section>
        </div>

        <section className={styles.callback} aria-labelledby="callback-title">
          <CallbackCard
            content={{ ...callback, title: texts.callback.title, subtitle: texts.callback.subtitle }}
            titleId="callback-title"
            source={{ page: `/vrachi/${doctor.slug}/`, label: fill(texts.callback.sourceLabel, { name: doctor.fullName }) }}
          />
        </section>
      </div>
    </div>
  );
}
