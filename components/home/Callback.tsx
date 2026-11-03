import { getHomeContent } from "@/lib/api";
import { asset } from "@/lib/asset";
import { CallbackForm } from "./CallbackForm";
import styles from "./Callback.module.css";

/**
 * Блок 8 главной — «Перезвоните мне» (чат 2E): светлая карточка, слева заголовок, подзаголовок и лёгкая форма,
 * справа вырезанное фото врача стоит на нижнем крае карточки, голова выходит за верхний край.
 * Без <Contraindications /> и листьев (DESIGN.md). Тексты — home.json → callback.
 */
export async function Callback() {
  const { callback } = await getHomeContent();
  const { title, subtitle, photo, ...texts } = callback;

  return (
    <section className={styles.section} aria-labelledby="callback-title">
      <div className="container">
        <div className={styles.card}>
          <div className={styles.head}>
            <h2 id="callback-title" className={styles.title}>
              {title}
            </h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <div className={styles.photo}>
            <img
              src={asset(photo.src)}
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className={styles.body}>
            <CallbackForm texts={texts} />
          </div>
        </div>
      </div>
    </section>
  );
}
