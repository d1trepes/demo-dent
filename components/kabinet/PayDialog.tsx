import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { fill, formatPrice } from "@/lib/format";
import type { CabinetContent, PlanStage } from "@/lib/types";
import { usePatientStore } from "@/store/patientStore";
import styles from "./Cabinet.module.css";

type Props = {
  stage: PlanStage;
  texts: CabinetContent["plan"]["dialog"];
  errorText: string;
  onClose: () => void;
  onPaid: () => void;
};

/** Модалка-заглушка оплаты этапа: нативный <dialog> (фокус и Esc — силами браузера). */
export function PayDialog({ stage, texts, errorText, onClose, onPaid }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const payStage = usePatientStore((s) => s.payStage);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const pay = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await payStage(stage.id);
      onPaid();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose} aria-labelledby="pay-title">
      <h2 id="pay-title" className={styles.dialogTitle}>
        {texts.title}
      </h2>
      <p className={styles.stageTitle}>{stage.title}</p>
      <dl className={styles.totals}>
        <div className={styles.left}>
          <dt>{texts.sumLabel}</dt>
          <dd>{formatPrice(stage.sum)}</dd>
        </div>
      </dl>
      <p className={styles.note}>{texts.demo}</p>
      {failed && (
        <p role="alert" className={styles.error}>
          {errorText}
        </p>
      )}
      <div className={styles.actions}>
        <Button disabled={busy} onClick={pay}>
          {busy ? texts.paying : fill(texts.confirm, { sum: formatPrice(stage.sum) })}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => ref.current?.close()}>
          {texts.cancel}
        </Button>
      </div>
    </dialog>
  );
}
