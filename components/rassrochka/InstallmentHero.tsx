import { fill, formatNumber } from "@/lib/format";
import type { InstallmentTerms, RassrochkaContent } from "@/lib/types";
import { InstallmentCalculator } from "./InstallmentCalculator";
import styles from "./InstallmentHero.module.css";

type Props = { content: RassrochkaContent; terms: InstallmentTerms };

/** Первый экран /rassrochka/: синяя плашка по сетке, слева заголовок и факты, справа калькулятор платежа. */
export function InstallmentHero({ content, terms }: Props) {
  const values = {
    months: terms.months.join(" или "),
    min: formatNumber(terms.minSum),
    max: formatNumber(terms.maxSum),
  };

  return (
    <section className={styles.hero} aria-labelledby="rassrochka-title">
      <div className={styles.text}>
        <h1 id="rassrochka-title" className={styles.title}>
          {content.title}
        </h1>
        <p className={styles.lead}>{content.lead}</p>
        <dl className={styles.facts}>
          {content.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fill(fact.value, values)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <InstallmentCalculator content={content.calc} terms={terms} className={styles.calc} />
    </section>
  );
}
