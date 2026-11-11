import { RevealTitle } from "@/components/ui/RevealTitle";
import { getBranches, getDoctors, getHomeContent } from "@/lib/api";
import { formatYears } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { DoctorsShowcase, type DoctorCard } from "./DoctorsShowcase";
import styles from "./Doctors.module.css";

/**
 * Блок 5 главной — «Врачи»: большое фото врача, текст и ряд маленьких фото (реф. ref-doctors-carousel.png), клик меняет местами.
 * Порядок — data/home.json → doctors.slugs, сами врачи — doctors.json через lib/api.ts.
 */
export async function Doctors() {
  const [{ doctors: content }, doctors, branches] = await Promise.all([getHomeContent(), getDoctors(), getBranches()]);
  const year = new Date().getFullYear();

  const cards: DoctorCard[] = content.slugs.flatMap((slug) => {
    const doctor = doctors.find((d) => d.slug === slug);
    if (!doctor) return [];
    // Стаж и филиал — одной строкой под ФИО (DESIGN.md, блок 5)
    const facts = [
      `Стаж ${formatYears(year - doctor.experienceSince)}`,
      doctor.branches.map((id) => branches.find((b) => b.id === id)?.name).filter(Boolean).join(" и "),
    ].filter((fact): fact is string => Boolean(fact));
    return [
      {
        slug: doctor.slug,
        fullName: doctor.fullName,
        position: doctor.position,
        facts,
        about: doctor.about,
        photo: doctor.photo,
      },
    ];
  });

  return (
    <section className={styles.section} aria-labelledby="doctors-title">
      <div className={`container ${styles.layout}`}>
        <RevealTitle id="doctors-title" text={content.title} className={styles.title} />
        <ButtonLink href={content.allDoctors.href} variant="secondary" className={styles.all}>
          {content.allDoctors.label}
        </ButtonLink>
        <div className={styles.showcase}>
          <DoctorsShowcase
            doctors={cards}
            photo={content.photo}
            labels={{ book: content.bookLabel, profile: content.profileLabel, thumbs: content.thumbsLabel }}
            allDoctors={content.allDoctors}
          />
        </div>
      </div>
    </section>
  );
}
