import { ChevronDown } from "lucide-react";
import { useId, type ComponentProps } from "react";
import { cx } from "@/lib/cx";
import field from "./TextField.module.css";
import styles from "./SelectField.module.css";

type Props = Omit<ComponentProps<"select">, "id"> & {
  label: string;
  error?: string;
};

/** Выпадающий список в стиле TextField: подпись над полем, пилюля 56 px, ошибка под полем. */
export function SelectField({ label, error, className, children, ...select }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cx(field.field, className)}>
      <label htmlFor={id} className={field.label}>
        {label}
      </label>
      <div className={styles.wrap}>
        <select
          id={id}
          className={cx(field.input, styles.select)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...select}
        >
          {children}
        </select>
        <ChevronDown className={styles.icon} size={20} aria-hidden />
      </div>
      {error && (
        <p id={errorId} className={field.error}>
          {error}
        </p>
      )}
    </div>
  );
}
