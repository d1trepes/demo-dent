"use client";

import { useSearchParams } from "next/navigation";
import { clinicNow, shiftMoment } from "@/lib/dates";
import { cx } from "@/lib/cx";
import { fill, formatDayMonth, formatMoment, shortName, timeOf } from "@/lib/format";
import { buildIcs, downloadIcs } from "@/lib/ics";
import type { BookingData } from "@/lib/types";
import { useAdminStore } from "@/store/adminStore";
import { useBookingStore } from "@/store/bookingStore";
import { usePatientStore } from "@/store/patientStore";
import { useHydrated } from "@/store/useHydrated";
import { Button, ButtonLink } from "@/components/ui/Button";
import styles from "./Done.module.css";

/** «Запись создана»: итог, календарь (.ics локально), напоминания. */
export function BookingDone({ data }: { data: BookingData }) {
  const t = data.content.done;
  const hydrated = useHydrated();
  const idParam = useSearchParams().get("id");
  const lastId = useBookingStore((s) => s.lastAppointmentId);
  const id = idParam ?? lastId;
  const fromPatient = usePatientStore((s) => s.appointments.find((a) => a.id === id));
  const fromAdmin = useAdminStore((s) => s.createdAppointments.find((a) => a.id === id));
  const appointment = fromPatient ?? fromAdmin;

  if (!hydrated) return <div className={cx("container", styles.page)} aria-busy="true" />;

  if (!appointment) {
    return (
      <div className={cx("container", styles.page)}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t.notFound.title}</h1>
          <p className={styles.lead}>{t.notFound.text}</p>
          <ButtonLink href="/zapis/" className={styles.action}>
            {t.notFound.action}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const doctor = data.doctors.find((d) => d.id === appointment.doctorId);
  const branch = data.branches.find((b) => b.id === appointment.branchId);
  const direction = data.directions.find((d) => d.id === appointment.directionId);
  const item = data.items.find((i) => i.id === appointment.serviceId);
  const serviceTitle = item?.title ?? direction?.title ?? "";
  const firstName = appointment.patient.name.split(" ")[0];
  const when = `${formatDayMonth(appointment.start)}, ${timeOf(appointment.start)}`;

  const now = clinicNow();
  const nowMoment = `${now.date}T${now.time}`;
  const reminders = [
    { text: t.reminders.before24, at: shiftMoment(appointment.start, -24 * 60) },
    { text: t.reminders.before2, at: shiftMoment(appointment.start, -2 * 60) },
  ].filter((r) => r.at > nowMoment);

  const addToCalendar = () =>
    downloadIcs(
      `yasen-${appointment.id}.ics`,
      buildIcs({
        uid: appointment.id,
        start: appointment.start,
        durationMin: appointment.durationMin,
        summary: fill(t.ics.summary, { service: serviceTitle }),
        description: fill(t.ics.description, { doctor: doctor?.fullName ?? "", id: appointment.id, phone: branch?.phone ?? "" }),
        location: branch ? `${branch.name}, ${branch.address}` : "",
      }),
    );

  const rows: [string, string][] = [
    [t.rows.doctor, doctor ? `${shortName(doctor.fullName)}, ${doctor.position.toLowerCase()}` : ""],
    [t.rows.branch, branch?.name ?? ""],
    [t.rows.address, branch?.address ?? ""],
    [t.rows.time, formatMoment(appointment.start)],
    [t.rows.service, serviceTitle],
    [t.rows.number, appointment.id.replace(/^ap-/, "").toUpperCase()],
  ];

  return (
    <div className={cx("container", styles.page)}>
      <div className={styles.layout}>
        <section className={styles.card} aria-labelledby="done-title">
          <h1 id="done-title" className={styles.title}>
            {t.title}
          </h1>
          <p className={styles.lead}>
            {appointment.urgent
              ? fill(t.urgentLead, { name: firstName, time: timeOf(appointment.start) })
              : fill(t.lead, { name: firstName, when })}{" "}
            {t.status}
          </p>

          <dl className={styles.details}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <section className={styles.reminders} aria-labelledby="reminders-title">
            <h2 id="reminders-title" className={styles.remindersTitle}>
              {t.reminders.title}
            </h2>
            <p>
              {reminders.length > 0
                ? fill(t.reminders.text, {
                    phone: appointment.patient.phone,
                    times: reminders
                      .map((r) => fill(r.text, { when: `${formatDayMonth(r.at)}, ${timeOf(r.at)}` }))
                      .join(t.reminders.joiner),
                  })
                : t.reminders.none}
            </p>
            <p className={styles.muted}>{t.reminders.settings}</p>
          </section>

          <div className={styles.actions}>
            <Button onClick={addToCalendar}>{t.calendar}</Button>
            <ButtonLink href="/zapis/" variant="secondary">
              {t.another}
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
