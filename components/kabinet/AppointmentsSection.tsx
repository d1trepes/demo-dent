import { clinicNow } from "@/lib/dates";
import type { BookingData, CabinetContent } from "@/lib/types";
import { usePatientStore } from "@/store/patientStore";
import { AppointmentCard } from "./AppointmentCard";
import styles from "./Cabinet.module.css";

type Props = { texts: CabinetContent; data: BookingData; notifyError: (text: string) => void };

/** Раздел «Записи»: ближайшие по возрастанию, прошедшие свернуты. */
export function AppointmentsSection({ texts, data, notifyError }: Props) {
  const appointments = usePatientStore((s) => s.appointments);
  const now = clinicNow();
  const nowKey = `${now.date}T${now.time}`;
  const upcoming = appointments.filter((a) => a.start >= nowKey).sort((a, b) => a.start.localeCompare(b.start));
  const past = appointments.filter((a) => a.start < nowKey).sort((a, b) => b.start.localeCompare(a.start));
  const t = texts.appointments;

  return (
    <section id="appointments" className={styles.section} aria-labelledby="appointments-title">
      <h2 id="appointments-title" className={styles.sectionTitle}>
        {texts.sections.appointments}
      </h2>
      {upcoming.length ? (
        <ul className={styles.list}>
          {upcoming.map((a) => (
            <li key={a.id}>
              <AppointmentCard appointment={a} texts={texts} data={data} upcoming notifyError={notifyError} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.muted}>{t.empty}</p>
      )}
      {past.length > 0 && (
        <details className={styles.past}>
          <summary className={styles.pastSummary}>
            {t.pastTitle} <span className={styles.count}>{past.length}</span>
          </summary>
          <ul className={styles.list}>
            {past.map((a) => (
              <li key={a.id}>
                <AppointmentCard appointment={a} texts={texts} data={data} upcoming={false} notifyError={notifyError} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
