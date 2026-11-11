import type { ReactNode } from "react";
import styles from "./ClinicInfo.module.css";

export type InfoRow = { key: string; label: string; value: ReactNode };

/** Строки «подпись — значение» в белой карточке: сведения о клинике и о враче (118н). */
export function InfoRows({ rows }: { rows: InfoRow[] }) {
  return (
    <dl className={styles.card}>
      {rows.map((r) => (
        <div key={r.key} className={styles.row}>
          <dt className={styles.label}>{r.label}</dt>
          <dd className={styles.value}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
