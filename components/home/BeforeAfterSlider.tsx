"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { asset } from "@/lib/asset";
import { formatCount } from "@/lib/format";
import type { BeforeAfterCase, HomeBeforeAfter } from "@/lib/types";
import styles from "./BeforeAfterSlider.module.css";

type Labels = Omit<HomeBeforeAfter, "title" | "cta" | "cases">;

type Props = {
  cases: BeforeAfterCase[];
  labels: Labels;
};

const START = 50;
/** Ручку не уводим к самым кончикам листа — там она уходит за форму. */
const MIN = 4;
const MAX = 96;
const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

/** Два слоя фото в листе: «после» снизу, «до» сверху обрезано по положению ползунка (--p). */
function LeafPhotos({ item, labels, showLabels }: { item: BeforeAfterCase; labels: Labels; showLabels: boolean }) {
  return (
    <>
      <div className={styles.layer}>
        <img
          src={asset(item.after.src)}
          width={item.after.width}
          height={item.after.height}
          alt={showLabels ? item.after.alt : ""}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {showLabels && <span className={`${styles.tag} ${styles.tagAfter}`}>{labels.afterLabel}</span>}
      </div>
      <div className={`${styles.layer} ${styles.before}`}>
        <img
          src={asset(item.before.src)}
          width={item.before.width}
          height={item.before.height}
          alt={showLabels ? item.before.alt : ""}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {showLabels && <span className={`${styles.tag} ${styles.tagBefore}`}>{labels.beforeLabel}</span>}
      </div>
      <span className={styles.line} aria-hidden />
    </>
  );
}

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 24 12" width="24" height="12" aria-hidden>
      <path d={direction === "next" ? "M0 6 H22 M17 1 L22 6 L17 11" : "M24 6 H2 M7 1 L2 6 L7 11"} />
    </svg>
  );
}

/**
 * Сравнение «до/после» по референсу ref-before-after.png: лист-«линза» с ползунком по центру,
 * соседние случаи по краям (≥ 1024), стрелки «назад/вперёд». Ползунок — мышь, палец, ←/→.
 */
export function BeforeAfterSlider({ cases, labels }: Props) {
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(START);
  const lensRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const count = cases.length;
  const current = cases[index];
  if (!current) return null;
  const prev = cases[(index - 1 + count) % count];
  const next = cases[(index + 1) % count];

  const go = (step: number) => {
    setIndex((i) => (i + step + count) % count);
    setPosition(START);
  };

  const moveTo = (clientX: number) => {
    const rect = lensRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(event.clientX);
  };

  const stopDrag = () => {
    dragging.current = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 };
    const step = steps[event.key];
    if (step !== undefined) {
      event.preventDefault();
      setPosition((p) => clamp(p + step));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setPosition(event.key === "Home" ? MIN : MAX);
    }
  };

  const rounded = Math.round(position);

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        {count > 2 && (
          <button
            type="button"
            className={`${styles.side} ${styles.sidePrev}`}
            onClick={() => go(-1)}
            tabIndex={-1}
            aria-hidden
          >
            <span key={prev.id} className={`${styles.leaf} ${styles.fade}`}>
              <LeafPhotos item={prev} labels={labels} showLabels={false} />
            </span>
          </button>
        )}

        <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} onClick={() => go(-1)} aria-label={`${labels.prevLabel}: ${prev.title}`}>
          <Arrow direction="prev" />
        </button>

        <div
          className={styles.compare}
          style={{ "--p": `${position}%` } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <div key={current.id} ref={lensRef} className={`${styles.leaf} ${styles.main} ${styles.fade}`}>
            <LeafPhotos item={current} labels={labels} showLabels />
          </div>
          <div
            className={styles.handle}
            role="slider"
            tabIndex={0}
            aria-label={labels.sliderLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rounded}
            aria-valuetext={`${labels.beforeLabel} ${rounded}%, ${labels.afterLabel.toLowerCase()} ${100 - rounded}%`}
            onKeyDown={onKeyDown}
          />
        </div>

        <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} onClick={() => go(1)} aria-label={`${labels.nextLabel}: ${next.title}`}>
          <Arrow direction="next" />
        </button>

        {count > 2 && (
          <button
            type="button"
            className={`${styles.side} ${styles.sideNext}`}
            onClick={() => go(1)}
            tabIndex={-1}
            aria-hidden
          >
            <span key={next.id} className={`${styles.leaf} ${styles.fade}`}>
              <LeafPhotos item={next} labels={labels} showLabels={false} />
            </span>
          </button>
        )}
      </div>

      <div key={`${current.id}-caption`} className={`${styles.caption} ${styles.fade}`} aria-live="polite">
        <p className={styles.caseTitle}>{current.title}</p>
        <p className={styles.caseMeta}>
          {current.specialty} · {formatCount(current.visits, labels.visitsWord)}
        </p>
      </div>
    </div>
  );
}
