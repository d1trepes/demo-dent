import { staticTexts } from "@/lib/staticTexts";

type Props = {
  /** banner — отдельной плашкой под рекламным блоком, inline — внутри карточки. Стили — чат 2. */
  variant?: "banner" | "inline";
  className?: string;
};

/**
 * Предупреждение по 38-ФЗ ст. 24 ч. 7: на всех рекламных блоках (баннеры, акции, страницы услуг,
 * калькулятор, рассрочка), заметно, не меньше 5% площади блока.
 */
export function Contraindications({ variant = "banner", className }: Props) {
  return (
    <p role="note" data-contraindications={variant} className={className}>
      {staticTexts.contraindications}
    </p>
  );
}
