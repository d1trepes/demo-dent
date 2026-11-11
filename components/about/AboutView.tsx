import { PageHead } from "@/components/ui/PageHead";
import { asset } from "@/lib/asset";
import { fill } from "@/lib/format";
import type { AboutContent, Branch, Clinic, Doctor } from "@/lib/types";
import { ClinicInfo } from "./ClinicInfo";
import { DoctorsTable } from "./DoctorsTable";
import styles from "./AboutView.module.css";

type Props = { content: AboutContent; clinic: Clinic; branches: Branch[]; doctors: Doctor[] };

/** /o-klinike/: о клинике → сведения о медорганизации (#svedeniya) → сводная таблица врачей. */
export function AboutView({ content, clinic, branches, doctors }: Props) {
  const { intro, info } = content;
  return (
    <div className={styles.page}>
      <div className="container">
        <PageHead title={content.title} lead={content.lead} />

        <section className={styles.intro} aria-labelledby="about-intro">
          <div className={styles.introText}>
            <h2 id="about-intro" className={styles.cardTitle}>
              {intro.title}
            </h2>
            {intro.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {fill(p, { year: clinic.foundedYear })}
              </p>
            ))}
          </div>
          {intro.photos.map((photo) => (
            <img
              key={photo.src}
              className={styles.photo}
              src={asset(photo.src)}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
          ))}
        </section>

        <section id="svedeniya" className={styles.section} aria-labelledby="svedeniya-title">
          <h2 id="svedeniya-title" className={styles.sectionTitle}>
            {info.title}
          </h2>
          <ClinicInfo clinic={clinic} branches={branches} texts={info} />
        </section>

        <section className={styles.section} aria-labelledby="doctors-title">
          <h2 id="doctors-title" className={styles.sectionTitle}>
            {content.doctors.title}
          </h2>
          <p className={styles.sectionLead}>{content.doctors.lead}</p>
          <DoctorsTable doctors={doctors} branches={branches} texts={content.doctors} />
        </section>

      </div>
    </div>
  );
}
