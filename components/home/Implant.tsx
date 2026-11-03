import { calcImplant, calcInstallment, getHomeContent, getImplantTariffs } from "@/lib/api";
import { ImplantCalculator, type ImplantQuote } from "./ImplantCalculator";
import { ImplantExploded } from "./ImplantExploded";
import styles from "./Implant.module.css";

/**
 * Блок 4 главной — «Имплантация под ключ»: имплант в разборе (сборка/разборка по скроллу)
 * и калькулятор-тизер. Все цифры — из services.json через lib/api.ts, считаются при сборке.
 */
export async function Implant() {
  const [{ implant }, { implant: tariffs }] = await Promise.all([getHomeContent(), getImplantTariffs()]);
  const { calculator } = implant;
  const maxTeeth = Math.min(calculator.maxTeeth, tariffs.maxTeeth);

  const quotes: ImplantQuote[] = tariffs.systems.flatMap((system) =>
    Array.from({ length: maxTeeth }, (_, i) => {
      const teeth = i + 1;
      const result = calcImplant({ teeth, systemId: system.id, crownId: calculator.crownId, includeBonePlasty: false });
      return {
        systemId: system.id,
        teeth,
        min: result.min,
        max: result.max,
        monthly: calcInstallment(result.min, calculator.months).monthly,
      };
    }),
  );
  const systems = tariffs.systems.map(({ id, title, origin }) => ({ id, title, origin }));

  return (
    <section className={styles.section} aria-labelledby="implant-title">
      <div className="container">
        <ImplantExploded
          content={implant}
          heading={
            <h2 id="implant-title" className={styles.title}>
              {implant.title}
            </h2>
          }
        />
        <div className={styles.calculator}>
          <ImplantCalculator content={{ ...calculator, maxTeeth }} systems={systems} quotes={quotes} />
        </div>
      </div>
    </section>
  );
}
