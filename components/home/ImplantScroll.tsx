"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { asset } from "@/lib/asset";
import type { HomeImplant, ImplantPart } from "@/lib/types";
import styles from "./ImplantScroll.module.css";

/*
 * Видео импланта по скроллу (блок 4, DESIGN.md).
 * Отрезок видео: кадр 0 — максимальный разбор, последний — правильная сборка.
 * Прогресс секции p: первая часть — видео задом наперёд (разбирается), середина HOLD — стоит
 * в разборе с подписями (правка 2C-2: подписи были видны мгновение), последняя — вперёд (собирается).
 * Первый и последний кадр одинаковые (собранный имплант).
 * Подписи появляются только у самого разбора: --k = 0 пока детали сомкнуты, 1 — полный разбор.
 */

/** Работает только на десктопе без reduced-motion; иначе — статичный кадр и список (CSS). */
const SCENE_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
/** Доля отрезка (от разбора), на которой подписи уже исчезли / ещё полностью видны. */
const REVEAL_FROM = 0.15;
const REVEAL_FULL = 0.04;
/** Доля прохода, когда имплант стоит разобранным (по центру). */
const HOLD = 0.34;
/** Плавность догоняния скролла (0–1 за кадр): меньше — мягче. */
const EASE = 0.1;
/** Не трогать currentTime ради сдвига меньше полкадра (24 к/с). */
const MIN_STEP = 1 / 48;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Прогресс прохода → доля отрезка видео: 1 — собран, 0 — максимальный разбор. */
function shareAt(p: number): number {
  const edge = (1 - HOLD) / 2;
  if (p < edge) return 1 - p / edge;
  if (p > 1 - edge) return (p - (1 - edge)) / edge;
  return 0;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function Callout({ part, index }: { part: ImplantPart; index: number }) {
  return (
    <li className={styles.callout} style={{ "--x": part.anchor.x, "--y": part.anchor.y, "--i": index } as Vars}>
      <span className={styles.leader} aria-hidden="true" />
      <span className={styles.label}>
        <span className={styles.calloutTitle}>{part.title}</span>
        <span className={styles.calloutText}>{part.text}</span>
      </span>
    </li>
  );
}

/** heading — заголовок секции: стоит внутри закреплённой сцены, чтобы был виден весь проход. */
export function ImplantScroll({ content, heading }: { content: HomeImplant; heading: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const figure = figureRef.current;
    const video = videoRef.current;
    if (!track || !figure || !video) return;

    const mq = window.matchMedia(SCENE_QUERY);
    let frame = 0;
    let visible = false;
    let current = -1;

    const duration = () => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0);

    const tick = () => {
      frame = 0;
      const T = duration();
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const p = distance > 0 ? clamp(-rect.top / distance) : 0;
      const share = shareAt(p);

      current = current < 0 ? share : current + (share - current) * EASE;
      if (Math.abs(share - current) < 0.001) current = share;

      const ready = T > 0 && video.readyState >= 2;
      if (ready && !video.seeking && Math.abs(video.currentTime - current * T) > MIN_STEP) {
        video.currentTime = current * T;
      }
      figure.style.setProperty("--k", ready ? String(clamp((REVEAL_FROM - current) / (REVEAL_FROM - REVEAL_FULL))) : "0");

      if (visible && current !== share) frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(tick);
    };

    // Ленивая загрузка: src ставим, когда до блока остаётся ~экран. До этого — постер (собранный кадр).
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || !mq.matches || video.getAttribute("src")) return;
        video.src = asset(content.video.src);
        video.load();
        loader.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    const watcher = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting) && mq.matches;
      schedule();
    });

    loader.observe(track);
    watcher.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    video.addEventListener("loadeddata", schedule);
    video.addEventListener("seeked", schedule);

    return () => {
      cancelAnimationFrame(frame);
      loader.disconnect();
      watcher.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      video.removeEventListener("loadeddata", schedule);
      video.removeEventListener("seeked", schedule);
    };
  }, [content.video.src]);

  const { video, exploded, parts } = content;

  return (
    <div ref={trackRef} className={styles.track}>
      <div className={`container ${styles.stage}`}>
        <div className={styles.heading}>{heading}</div>

        <div className={styles.text}>
          {content.paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </div>

        <div
          ref={figureRef}
          className={styles.scene}
          style={{ "--ratio": video.width / video.height } as Vars}
        >
          <video
            ref={videoRef}
            className={styles.video}
            poster={asset(video.poster)}
            width={video.width}
            height={video.height}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
          />
          <ul className={styles.callouts}>
            {parts.map((part, i) => (
              <Callout key={part.id} part={part} index={i} />
            ))}
          </ul>
        </div>

        <div className={styles.static}>
          <img
            className={styles.staticImage}
            src={asset(exploded.src)}
            width={exploded.width}
            height={exploded.height}
            alt={exploded.alt}
            loading="lazy"
            decoding="async"
          />
          <ul className={styles.list}>
            {parts.map((part) => (
              <li key={part.id} className={styles.listItem}>
                <span className={styles.calloutTitle}>{part.title}</span>
                <span className={styles.calloutText}>{part.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
