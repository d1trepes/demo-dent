import Link from "next/link";
import { useId, type ComponentProps } from "react";
import { cx } from "@/lib/cx";
import styles from "./ConsentCheckbox.module.css";

type Props = Omit<ComponentProps<"input">, "type" | "id" | "defaultChecked" | "children"> & {
  /** Текст до ссылки: «Даю согласие на обработку персональных данных». */
  label: string;
  /** Ссылка на отдельный документ согласия (/soglasie/ или /soglasie-zdorovye/). */
  docHref: string;
  docLabel?: string;
  /** Вторая ссылка — на политику обработки ПДн (/privacy/), если форма её показывает. */
  policyHref?: string;
  policyLabel?: string;
  error?: string;
};

/**
 * Отдельный чекбокс согласия (152-ФЗ ст. 9): по умолчанию не отмечен, ссылка на текст согласия.
 * defaultChecked запрещён типом, чтобы галочку нельзя было поставить заранее.
 */
export function ConsentCheckbox({
  label,
  docHref,
  docLabel = "Текст согласия",
  policyHref,
  policyLabel = "Политика обработки данных",
  error,
  className,
  ...input
}: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cx(styles.field, className)}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...input}
      />
      <label htmlFor={id} className={styles.label}>
        {label}.{" "}
        <Link href={docHref} target="_blank" className={styles.link}>
          {docLabel}
        </Link>
        {policyHref && (
          <>
            {" · "}
            <Link href={policyHref} target="_blank" className={styles.link}>
              {policyLabel}
            </Link>
          </>
        )}
      </label>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
