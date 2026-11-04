import { asset } from "@/lib/asset";
import type { HomeCallback } from "@/lib/types";
import { CallbackForm } from "./CallbackForm";
import styles from "./Callback.module.css";

type Props = {
  /** Тексты формы и фото — home.json → callback; title и subtitle страница может заменить своими. */
  content: HomeCallback;
  titleId: string;
  source?: { page: string; label: string };
};

/** Карточка «Перезвоните мне»: заголовок, подзаголовок, форма и фото врача. Используется на главной и в /rassrochka/. */
export function CallbackCard({ content, titleId, source }: Props) {
  const { title, subtitle, photo, ...texts } = content;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.photo}>
        <img src={asset(photo.src)} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" />
      </div>

      <div className={styles.body}>
        <CallbackForm texts={texts} source={source} />
      </div>
    </div>
  );
}
