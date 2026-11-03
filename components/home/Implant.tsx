import { getHomeContent, getServices } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Contraindications } from "@/components/ui/Contraindications";
import { ImplantExploded } from "./ImplantExploded";
import styles from "./Implant.module.css";

/**
 * Блок 4 главной — «Имплантация под ключ»: имплант в разборе (сборка/разборка по скроллу)
 * и строка с ценой «от» + запись на консультацию с КТ. Калькулятор убран в 2C-1:
 * пациент не знает свой случай, цену называем после КТ (манифест блока 3).
 */
export async function Implant() {
  const [{ implant }, { directions }] = await Promise.all([getHomeContent(), getServices()]);
  const { offer } = implant;
  const priceFrom = directions.find((d) => d.id === offer.directionId)?.priceFrom;

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
        <div className={styles.offer}>
          <div className={styles.offerPrice}>
            <p className={styles.offerTitle}>{offer.title}</p>
            {priceFrom !== undefined && <p className={styles.offerValue}>{formatPrice(priceFrom, true)}</p>}
          </div>
          <p className={styles.offerNote}>{offer.note}</p>
          <ButtonLink href={offer.cta.href} className={styles.offerCta}>
            {offer.cta.label}
          </ButtonLink>
          <Contraindications variant="inline" className={styles.offerWarning} />
        </div>
      </div>
    </section>
  );
}
