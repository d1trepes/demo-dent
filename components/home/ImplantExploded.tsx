import type { CSSProperties, ReactNode } from "react";
import { asset } from "@/lib/asset";
import type { HomeImplant, ImplantPart } from "@/lib/types";
import styles from "./ImplantExploded.module.css";

/*
 * Имплант в разборе (блок 4). Все размеры — в долях ширины холста детали --w (CSS).
 * Разобранное состояние — базовое (оно же фолбэк). Собранное задаётся сдвигом --ty:
 * детали съезжаются к фото implant-assembled, анимация по скроллу разводит их обратно.
 */
/** Зазор между деталями в разобранном виде. */
const GAP = 0.3;
/** Где верх детали в собранном виде, от верха фото «в сборе» (подобрано по фото). */
const ASSEMBLED_TOP: Record<ImplantPart["id"], number> = { crown: 0.27, abutment: 0.75, screw: 1.4 };
/** Поворот по Y и наклон в разобранном виде (фото плоские — это эффект «вращения»). */
const TURN: Record<ImplantPart["id"], { ry: number; rz: number }> = {
  crown: { ry: -12, rz: -4 },
  abutment: { ry: 12, rz: 2 },
  screw: { ry: -12, rz: 3 },
};
/** Порядок слоёв в сборке: коронка закрывает конус абатмента, винт — его штифт. */
const LAYER: Record<ImplantPart["id"], number> = { crown: 3, abutment: 1, screw: 2 };
/** Блик — только по металлу. */
const METAL: ImplantPart["id"][] = ["abutment", "screw"];

const ratio = (p: { width: number; height: number }) => p.height / p.width;

function layout(content: HomeImplant) {
  let top = 0;
  const exploded = content.parts.map((part) => {
    const h = ratio(part.image);
    const item = { part, top, h };
    top += h + GAP;
    return item;
  });
  const height = top - GAP;
  const assembledTop = (height - ratio(content.assembled)) / 2;
  return {
    height,
    assembledTop,
    parts: exploded.map(({ part, top: t, h }) => ({ part, top: t, h, ty: assembledTop + ASSEMBLED_TOP[part.id] - t })),
  };
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** heading — заголовок секции: стоит внутри сцены, чтобы был виден, пока блок закреплён. */
export function ImplantExploded({ content, heading }: { content: HomeImplant; heading: ReactNode }) {
  const scene = layout(content);

  return (
    <div className={styles.track}>
      <div className={styles.stage}>
        <div className={styles.heading}>{heading}</div>
        <div className={styles.text}>
          {content.paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </div>

        <div className={styles.figure} style={{ "--fh": scene.height, "--at": scene.assembledTop } as Vars}>
          <img
            className={styles.assembled}
            src={asset(content.assembled.src)}
            width={content.assembled.width}
            height={content.assembled.height}
            alt={content.assembled.alt}
            loading="lazy"
            decoding="async"
          />

          {scene.parts.map(({ part, top, ty }) => (
            <div
              key={part.id}
              className={styles.part}
              aria-hidden="true"
              style={
                {
                  "--top": top,
                  "--ty": ty,
                  "--ry": `${TURN[part.id].ry}deg`,
                  "--rz": `${TURN[part.id].rz}deg`,
                  "--mask": `url("${asset(part.image.src)}")`,
                  zIndex: LAYER[part.id],
                } as Vars
              }
            >
              <img src={asset(part.image.src)} width={part.image.width} height={part.image.height} alt="" loading="lazy" decoding="async" />
              {METAL.includes(part.id) && <span className={styles.shine} />}
            </div>
          ))}

          <ul className={styles.callouts}>
            {scene.parts.map(({ part, top, h }) => (
              <li
                key={part.id}
                className={styles.callout}
                style={{ "--y": top + h / 2, "--half": part.visibleWidth / 2 } as Vars}
              >
                <span className={styles.leader} aria-hidden="true" />
                <span className={styles.label}>
                  <span className={styles.calloutTitle}>{part.title}</span>
                  <span className={styles.calloutText}>{part.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
