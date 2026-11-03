import { CircleAlert } from "lucide-react";
import { cx } from "@/lib/cx";
import { staticTexts } from "@/lib/staticTexts";
import styles from "./Contraindications.module.css";

type Props = {
  /** banner — полосой во всю ширину рекламного блока, inline — плашкой внутри карточки. */
  variant?: "banner" | "inline";
  /** light — на светлом фоне, onBlue — на синей плашке. */
  tone?: "light" | "onBlue";
  className?: string;
};

/**
 * Предупреждение по 38-ФЗ ст. 24 ч. 7: на всех рекламных блоках (баннеры, акции, страницы услуг,
 * калькулятор, рассрочка), заметно, не меньше 5% площади блока. Не делать мельче и бледнее.
 */
export function Contraindications({ variant = "banner", tone = "light", className }: Props) {
  return (
    <p
      role="note"
      data-contraindications={variant}
      className={cx(styles.note, styles[variant], tone === "onBlue" && styles.onBlue, className)}
    >
      <CircleAlert aria-hidden size={20} strokeWidth={2} className={styles.icon} />
      <span>{staticTexts.contraindications}</span>
    </p>
  );
}
