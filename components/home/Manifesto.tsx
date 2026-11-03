import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import type { HomeManifesto } from "@/lib/types";
import styles from "./Manifesto.module.css";

/**
 * Манифест блока 3: слова проявляются при скролле (CSS scroll-driven animations, docs/DESIGN.md «Блок 3»).
 * Для скринридера — цельная фраза в visually-hidden, видимые слова скрыты от него.
 */
export function Manifesto({ content, id }: { content: HomeManifesto; id: string }) {
  const fullText = content.segments.flatMap((s) => (s.kind === "text" ? [s.text] : [])).join(" ");

  const total = fullText.split(/\s+/).filter(Boolean).length;
  let index = 0;

  return (
    <h2 id={id} className={styles.manifesto}>
      <span className="visually-hidden">{fullText}</span>
      <span aria-hidden className={styles.visual}>
        {content.segments.map((segment, si) => {
          if (segment.kind === "pill") {
            return (
              <span key={si} className={styles.pill}>
                <img
                  src={asset(segment.image.src)}
                  width={segment.image.width}
                  height={segment.image.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
            );
          }
          return segment.text
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => {
              const p = total > 1 ? index / (total - 1) : 0;
              index += 1;
              return (
                <span key={`${si}-${index}`} className={styles.word} style={{ "--p": p.toFixed(3) } as CSSProperties}>
                  {word}
                </span>
              );
            });
        })}
      </span>
    </h2>
  );
}
