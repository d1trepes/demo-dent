import { getHomeContent } from "@/lib/api";
import { CallbackCard } from "./CallbackCard";
import styles from "./Callback.module.css";

/**
 * Блок 8 главной — «Перезвоните мне» (чат 2E): светлая карточка, слева заголовок, подзаголовок и лёгкая форма,
 * справа вырезанное фото врача стоит на нижнем крае карточки, голова выходит за верхний край.
 * Без <Contraindications /> и листьев (DESIGN.md). Тексты — home.json → callback.
 */
export async function Callback() {
  const { callback } = await getHomeContent();

  return (
    <section className={styles.section} aria-labelledby="callback-title">
      <div className="container">
        <CallbackCard content={callback} titleId="callback-title" />
      </div>
    </section>
  );
}
