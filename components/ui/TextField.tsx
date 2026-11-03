import { useId, type ComponentProps } from "react";
import { cx } from "@/lib/cx";
import styles from "./TextField.module.css";

type Props = Omit<ComponentProps<"input">, "id" | "children"> & {
  label: string;
  error?: string;
};

/** Поле формы: подпись над полем, высота 56, скругление как у кнопок, ошибка под полем (aria-invalid + aria-describedby). */
export function TextField({ label, error, className, ...input }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...input}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
