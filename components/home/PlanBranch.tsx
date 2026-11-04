import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { PlanBranchStep, PlanContent } from "@/lib/types";
import styles from "./PlanBranch.module.css";

/*
 * Ветка плана (блок 3). Десктоп (≥ 1200 px) — сцена 1120 px: линия-змейка по центру,
 * листья 200 px чередуются слева и справа, черенок входит в основание листа под 45°.
 * Ниже 1200 px — линия по левому краю, листья 120 px справа от неё (геометрия в CSS).
 * Константы — только геометрия сцены, контент приходит из data/home.json.
 */
const STAGE_W = 1120;
const ROW_H = [300, 300, 300, 300];
const LEAF = 200;
const LEAF_TOP = 16;
/** Линия отходит от листа: у левого шага правее центра, у правого — левее. */
const LINE_X = { left: 620, right: 500 } as const;
/** Основание листа — 60 px от линии по горизонтали, 30 px выше точки на линии. */
const STEM_DX = 60;
const STEM_DY = 30;
/** Последний прямой отрезок черенка вдоль диагонали листа (под 45°), до основания. */
const STRAIGHT = 18;
/** Черенок заходит внутрь листа на 4 px по диагонали — без зазора. */
const OVERLAP = 4;
/** Плечо второй контрольной точки — на той же диагонали, кривая выходит на ось листа плавно. */
const TANGENT = 16;

type Side = keyof typeof LINE_X;

const sideOf = (i: number): Side => (i % 2 === 0 ? "left" : "right");
const rowTops = ROW_H.map((_, i) => ROW_H.slice(0, i).reduce((s, h) => s + h, 0));
const STAGE_H = ROW_H.reduce((s, h) => s + h, 0);

/** Змейка: прямые участки у каждого шага, S-переходы на границах строк. */
function linePath(count: number): string {
  const xs = Array.from({ length: count }, (_, i) => LINE_X[sideOf(i)]);
  let d = `M${xs[0]} 0`;
  for (let i = 1; i < count; i++) {
    const b = rowTops[i];
    d += ` V${b - 70} C${xs[i - 1]} ${b} ${xs[i]} ${b} ${xs[i]} ${b + 70}`;
  }
  return `${d} V${STAGE_H}`;
}

/** Черенок в координатах строки: кривая от линии выходит на ось листа, дальше прямой отрезок под 45° в основание. */
function stemPath(side: Side): string {
  const x = LINE_X[side];
  const dir = side === "left" ? -1 : 1;
  const baseX = x + dir * STEM_DX;
  const baseY = LEAF_TOP + LEAF;
  const startY = baseY + STEM_DY;
  const onAxis = (k: number) => `${baseX - dir * k} ${baseY + k}`;
  return `M${x} ${startY} C${x + dir * 20} ${startY + 2} ${onAxis(STRAIGHT + TANGENT)} ${onAxis(STRAIGHT)} L${onAxis(-OVERLAP)}`;
}

function stepVars(i: number): CSSProperties {
  const side = sideOf(i);
  const x = LINE_X[side];
  const leafX = side === "left" ? x - STEM_DX - LEAF : x + STEM_DX;
  return {
    "--row-h": `${ROW_H[i]}px`,
    "--leaf-x": `${leafX}px`,
    "--leaf-top": `${LEAF_TOP}px`,
    "--leaf-s": `${LEAF}px`,
  } as CSSProperties;
}

/** compact — внутренние страницы: меньший отступ сверху (манифест стоит прямо над веткой). */
export function PlanBranch({ content, compact = false }: { content: PlanContent; compact?: boolean }) {
  const steps = content.steps.slice(0, ROW_H.length);

  return (
    <div className={cx(styles.branch, compact && styles.compact)}>
      <svg className={styles.lineDesktop} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} width={STAGE_W} height={STAGE_H} aria-hidden>
        <path className={styles.line} d={linePath(steps.length)} pathLength={1} />
      </svg>
      <svg className={styles.lineMobile} viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden>
        <path className={styles.line} d="M1 0 V100" pathLength={1} />
      </svg>

      <ol className={styles.steps}>
        {steps.map((step, i) => (
          <li key={step.number} className={cx(styles.step, styles[sideOf(i)])} style={stepVars(i)}>
            <svg className={styles.stemDesktop} viewBox={`0 0 ${STAGE_W} ${ROW_H[i]}`} aria-hidden>
              <path d={stemPath(sideOf(i))} />
            </svg>
            <svg className={styles.stemMobile} viewBox="0 0 60 160" aria-hidden>
              <path d="M11 160 C11 154 14 146 26 134 L44 116" />
            </svg>
            <Leaf step={step} />
            <div className={styles.text}>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.caption}>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Лист-«линза» как в hero: обводка 2 px кобальт поверх непрозрачного фото. */
function Leaf({ step }: { step: PlanBranchStep }) {
  return (
    <div className={styles.leaf}>
      <img
        src={asset(step.leaf.src)}
        width={step.leaf.width}
        height={step.leaf.height}
        alt={step.leaf.alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
