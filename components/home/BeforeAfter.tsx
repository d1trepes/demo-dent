import { getHomeContent } from "@/lib/api";
import { ButtonLink } from "@/components/ui/Button";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import styles from "./BeforeAfter.module.css";

/**
 * Блок 6 главной — «До/после» (реф. ref-before-after.png): сравнение в форме листа с ползунком,
 * соседние случаи по краям. Подписи — нейтральный клинический случай (38-ФЗ, см. PROGRESS.md).
 * Тексты и фото — data/home.json → beforeAfter.
 */
export async function BeforeAfter() {
  const { beforeAfter: content } = await getHomeContent();
  const { cases, cta, title, ...labels } = content;

  return (
    <section className={styles.section} aria-labelledby="before-after-title">
      <div className="container">
        <h2 id="before-after-title" className={styles.title}>
          {title}
        </h2>
      </div>
      <BeforeAfterSlider cases={cases} labels={labels} />
      <div className={styles.cta}>
        <ButtonLink href={cta.href} variant="secondary">
          {cta.label}
        </ButtonLink>
      </div>
    </section>
  );
}
