import { useState } from "react";
import { Avatar } from "@/components/booking/Avatar";
import { StepTime } from "@/components/booking/StepTime";
import { Button } from "@/components/ui/Button";
import { fill, formatMoment } from "@/lib/format";
import type { Appointment, BookingData, CabinetContent, Slot } from "@/lib/types";
import { initialDraft } from "@/store/bookingStore";
import { usePatientStore } from "@/store/patientStore";
import styles from "./Cabinet.module.css";

type Props = {
  appointment: Appointment;
  texts: CabinetContent;
  data: BookingData;
  upcoming: boolean;
  notifyError: (text: string) => void;
};

type Mode = "idle" | "reschedule" | "cancel";

/** Карточка записи: дата, врач, услуга, филиал, статус. У будущих — перенос (выбор слота как в мастере) и отмена. */
export function AppointmentCard({ appointment: a, texts, data, upcoming, notifyError }: Props) {
  const t = texts.appointments;
  const reschedule = usePatientStore((s) => s.reschedule);
  const cancel = usePatientStore((s) => s.cancel);
  const [mode, setMode] = useState<Mode>("idle");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);

  const doctor = data.doctors.find((d) => d.id === a.doctorId);
  const branch = data.branches.find((b) => b.id === a.branchId);
  const service =
    data.items.find((i) => i.id === a.serviceId)?.title ?? data.directions.find((d) => d.id === a.directionId)?.title;
  const active = upcoming && a.status !== "cancelled";

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      setMode("idle");
      setSlot(null);
    } catch {
      notifyError(texts.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={styles.card} data-muted={active ? undefined : ""}>
      <div className={styles.apRow}>
        <div>
          <p className={styles.apWhen}>{formatMoment(a.start)}</p>
          <p className={styles.apService}>
            {service}
            {a.urgent && <span className={styles.chip}>{t.urgent}</span>}
          </p>
          {branch && (
            <p className={styles.muted}>
              {branch.name}, {branch.address}
            </p>
          )}
        </div>
        <span className={styles.status} data-status={a.status}>
          {t.statuses[a.status]}
        </span>
      </div>

      {doctor && (
        <div className={styles.doctor}>
          <Avatar fullName={doctor.fullName} photo={doctor.photo} />
          <div>
            <p className={styles.doctorName}>{doctor.fullName}</p>
            <p className={styles.muted}>{doctor.position}</p>
          </div>
        </div>
      )}

      {active && mode === "idle" && (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setMode("reschedule")}>
            {t.reschedule}
          </Button>
          <Button variant="secondary" onClick={() => setMode("cancel")}>
            {t.cancel}
          </Button>
        </div>
      )}

      {active && mode === "cancel" && (
        <div className={styles.panel} role="group" aria-label={t.cancel}>
          <p className={styles.panelTitle}>{fill(t.cancelQuestion, { when: formatMoment(a.start) })}</p>
          <div className={styles.actions}>
            <Button disabled={busy} onClick={() => run(() => cancel(a.id))}>
              {busy ? t.saving : t.cancelYes}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setMode("idle")}>
              {t.cancelNo}
            </Button>
          </div>
        </div>
      )}

      {active && mode === "reschedule" && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>{t.rescheduleTitle}</p>
          <StepTime
            data={data}
            draft={{
              ...initialDraft,
              directionId: a.directionId,
              serviceId: a.serviceId ?? null,
              doctorId: a.doctorId,
              slot,
            }}
            update={(patch) => setSlot(patch.slot ?? null)}
          />
          <div className={styles.actions}>
            <Button disabled={!slot || busy} onClick={() => slot && run(() => reschedule(a.id, slot))}>
              {busy ? t.saving : slot ? fill(t.rescheduleSave, { when: formatMoment(slot.start) }) : t.reschedule}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => setMode("idle")}>
              {t.close}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
