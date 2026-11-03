import { getHomeContent } from "@/lib/api";
import { ImplantScroll } from "./ImplantScroll";
import styles from "./Implant.module.css";

/**
 * Блок 4 главной — «Имплантация под ключ»: 2 абзаца слева, по центру видео импланта,
 * проматываемое скроллом (разбирается → собирается), подписи деталей как у DENTAX.
 * Без цены, калькулятора и предупреждения (на главной оно только в подвале — DESIGN.md).
 */
export async function Implant() {
  const { implant } = await getHomeContent();

  return (
    <section className={styles.section} aria-labelledby="implant-title">
      <ImplantScroll
        content={implant}
        heading={
          <h2 id="implant-title" className={styles.title}>
            {implant.title}
          </h2>
        }
      />
    </section>
  );
}
