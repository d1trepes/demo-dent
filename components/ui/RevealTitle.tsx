import type { CSSProperties, ElementType } from "react";
import { asset } from "@/lib/asset";
import type { Picture } from "@/lib/types";
import styles from "./RevealTitle.module.css";

type Props = {
  id: string;
  text: string;
  className?: string;
  as?: ElementType;
  /** Фото-таблетка в строке заголовка (как в манифесте блока 3): встаёт после слова с номером `after`. */
  pill?: { after: number; image: Picture };
};

/**
 * Заголовок блока главной с переливом по скроллу (2D): слова заливаются из --color-border в --color-text,
 * пока заголовок входит в экран. Слова делятся только по обычному пробелу — «в Екатеринбурге» не рвётся.
 * Скринридер читает цельный текст. Без поддержки scroll-driven animations и при reduced-motion — сразу тёмный.
 */
export function RevealTitle({ id, text, className, as: Tag = "h2", pill }: Props) {
  const words = text.split(" ").filter(Boolean);
  const last = Math.max(words.length - 1, 1);

  return (
    <Tag id={id} className={`${styles.title} ${className ?? ""}`}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            {i > 0 && " "}
            <span className={styles.word} style={{ "--p": (i / last).toFixed(3) } as CSSProperties}>
              {word}
            </span>
            {pill && pill.after === i + 1 && (
              <>
                {" "}
                <span className={styles.pill}>
                  <img src={asset(pill.image.src)} width={pill.image.width} height={pill.image.height} alt="" loading="lazy" decoding="async" />
                </span>
              </>
            )}
          </span>
        ))}
      </span>
    </Tag>
  );
}
