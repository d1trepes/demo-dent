import { useState } from "react";
import type { CabinetContent, ReminderChannel, ReminderSettings } from "@/lib/types";
import { usePatientStore } from "@/store/patientStore";
import { Switch } from "./Switch";
import styles from "./Cabinet.module.css";

type Props = { texts: CabinetContent; notify: (text: string) => void };

const CHANNELS: ReminderChannel[] = ["sms", "telegram", "max"];

/** Раздел «Напоминания»: каналы и время, каждое переключение сразу сохраняется (тост «Сохранено»). */
export function RemindersSection({ texts, notify }: Props) {
  const reminders = usePatientStore((s) => s.reminders);
  const setReminders = usePatientStore((s) => s.setReminders);
  const [busy, setBusy] = useState(false);
  const t = texts.reminders;
  if (!reminders) return null;

  const save = async (next: ReminderSettings) => {
    setBusy(true);
    try {
      await setReminders(next);
      notify(t.saved);
    } catch {
      notify(texts.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reminders" className={styles.section} aria-labelledby="reminders-title">
      <h2 id="reminders-title" className={styles.sectionTitle}>
        {texts.sections.reminders}
      </h2>
      <div className={styles.card}>
        <p className={styles.muted}>{t.lead}</p>
        <div className={styles.switchGroups}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t.channelsTitle}</legend>
            {CHANNELS.map((ch) => (
              <Switch
                key={ch}
                label={t.channels[ch]}
                checked={reminders.channels[ch]}
                disabled={busy}
                onChange={(v) => save({ ...reminders, channels: { ...reminders.channels, [ch]: v } })}
              />
            ))}
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t.timingTitle}</legend>
            <Switch
              label={t.before24h}
              checked={reminders.before24h}
              disabled={busy}
              onChange={(v) => save({ ...reminders, before24h: v })}
            />
            <Switch
              label={t.before2h}
              checked={reminders.before2h}
              disabled={busy}
              onChange={(v) => save({ ...reminders, before2h: v })}
            />
          </fieldset>
        </div>
      </div>
    </section>
  );
}
