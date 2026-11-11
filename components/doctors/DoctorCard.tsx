import { ButtonLink } from "@/components/ui/Button";
import { asset } from "@/lib/asset";
import { addDays, clinicNow } from "@/lib/dates";
import { fill, formatDayMonth, formatYears, timeOf } from "@/lib/format";
import type { Doctor, DoctorsPageContent, Slot } from "@/lib/types";
import styles from "./DoctorCard.module.css";

type Props = {
  doctor: Doctor;
  texts: DoctorsPageContent["list"];
  specialty: string;
  branches: string[];
  /** undefined — ещё грузится, null — на неделе мест нет. */
  nearest: Slot | null | undefined;
};

function nearestText(slot: Slot, texts: Props["texts"]): string {
  const today = clinicNow().date;
  const date = slot.start.slice(0, 10);
  const day = date === today ? texts.today : date === addDays(today, 1) ? texts.tomorrow : formatDayMonth(date);
  return fill(texts.nearest, { when: `${day}, ${timeOf(slot.start)}` });
}

/** Белая карточка врача: фото слева, справа текст, внизу две кнопки. Сама карточка не ссылка. */
export function DoctorCard({ doctor, texts, specialty, branches, nearest }: Props) {
  const years = new Date().getFullYear() - doctor.experienceSince;
  const status = nearest === undefined ? texts.nearestLoading : nearest ? nearestText(nearest, texts) : texts.nearestNone;

  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        <img src={asset(doctor.photo)} width={720} height={960} alt="" loading="lazy" decoding="async" />
      </div>

      <div className={styles.body}>
        <p className={styles.specialty}>{specialty}</p>
        <h2 className={styles.name}>{doctor.fullName}</h2>
        <p className={styles.meta}>
          {fill(texts.experience, { years: formatYears(years) })}
          <br />
          {branches.map((b) => `«${b}»`).join(", ")}
        </p>
        <p className={styles.nearest} aria-live="polite">
          {status}
        </p>

        <div className={styles.actions}>
          <ButtonLink href={`/zapis/?doctor=${doctor.slug}`} className={styles.button}>
            {texts.book}
          </ButtonLink>
          <ButtonLink href={`/vrachi/${doctor.slug}/`} variant="secondary" className={styles.button}>
            {texts.about}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
