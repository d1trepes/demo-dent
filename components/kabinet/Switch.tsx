import styles from "./Cabinet.module.css";

type Props = { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void };

/** Переключатель: строка 52 px, подпись слева, трек справа; под капотом checkbox с role="switch". */
export function Switch({ label, checked, disabled, onChange }: Props) {
  return (
    <label className={styles.switch}>
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        className={styles.switchInput}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
