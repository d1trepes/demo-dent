import Link from "next/link";
import { formatMoment } from "@/lib/format";
import type { Appointment, BookingContent } from "@/lib/types";
import styles from "./Done.module.css";

type Props = {
  texts: BookingContent["done"]["telegram"];
  appointment: Appointment;
  directionTitle: string;
  doctorName: string;
  branchName: string;
};

/**
 * Превью уведомления администратору. Намеренно без повода обращения: описание жалоб —
 * данные о здоровье, их не отправляем в мессенджер (docs/HANDOFF.md → уведомления).
 */
export function TelegramPreview({ texts, appointment, directionTitle, doctorName, branchName }: Props) {
  const fields: [string, string][] = [
    [texts.fields.patient, appointment.patient.name],
    [texts.fields.phone, appointment.patient.phone],
    [texts.fields.direction, directionTitle],
    [texts.fields.doctor, doctorName],
    [texts.fields.branch, branchName],
    [texts.fields.time, formatMoment(appointment.start)],
    [texts.fields.source, appointment.source.label],
  ];
  return (
    <section className={styles.telegram} aria-labelledby="telegram-title">
      <h2 id="telegram-title" className={styles.sideTitle}>
        {texts.title}
      </h2>
      <div className={styles.bubble}>
        <p className={styles.bubbleHead}>
          {texts.header} <span className={styles.bubbleId}>№ {appointment.id.replace(/^ap-/, "").toUpperCase()}</span>
        </p>
        {appointment.urgent && <p className={styles.bubbleUrgent}>{texts.urgent}</p>}
        <dl className={styles.bubbleFields}>
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}:</dt> <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.bubbleButtons} aria-hidden>
          {texts.buttons.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      <p className={styles.muted}>{texts.note}</p>
      <Link href="/admin/" className={styles.link}>
        {texts.adminLink}
      </Link>
    </section>
  );
}
