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

/** Сцена по скроллу везде без reduced-motion (8А-2: и на мобильном); иначе — статичный кадр и список (CSS). */
const SCENE_QUERY = "(prefers-reduced-motion: no-preference)";
/** На мобильном закреплена только сцена в своей обёртке, на десктопе — вся секция. */
const DESKTOP_QUERY = "(min-width: 1024px)";
/** Доля отрезка (от разбора), на которой подписи уже исчезли / ещё полностью видны. */
const REVEAL_FROM = 0.15;
const REVEAL_FULL = 0.04;
/** Доля прохода, когда имплант стоит разобранным (по центру). */
const HOLD = 0.34;
/** Плавность догоняния скролла (0–1 за кадр): меньше — мягче. */
const EASE = 0.12;
/** Для кадров на canvas: отрисовка дешёвая, догоняем скролл быстрее. */
const EASE_FRAMES = 0.3;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const figure = figureRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const sceneTrack = sceneTrackRef.current;
    const ctx = canvas?.getContext("2d");
    if (!track || !figure || !video || !canvas || !ctx || !sceneTrack) return;

    const mq = window.matchMedia(SCENE_QUERY);
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const { count, pattern } = content.video.frames;
    const frames: (HTMLImageElement | undefined)[] = [];
    let frame = 0;
    let visible = false;
    let current = -1;
    let videoReady = false;
    let videoStarted = false;
    let framesStarted = false;
    let drawn = -1;
    let blobUrl = "";
    let stickTop = 0;
    let figureH = 0;
    let width = 0;

    // Высота экрана фиксируется один раз (и при смене ширины): в Telegram/iOS панели браузера
    // при скролле вверх меняют высоту окна — с svh/vh сцена «прыгала» и дёргалась (8Б).
    const measure = () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        track.style.setProperty("--ih", `${window.innerHeight}px`);
      }
      stickTop = desktop.matches ? 0 : parseFloat(getComputedStyle(figure).top) || 0;
      figureH = figure.offsetHeight;
    };
    measure();

    const duration = () => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0);

    // Мягкий край цветом страницы поверх кадра: сжатие чуть сдвигает цвет фона, без этого виден прямоугольник.
    // Рисуется вместе с кадром — дешевле маски, которая на iOS перерисовывается отдельно.
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#f3f4f8";
    const feather = () => {
      const { width: w, height: h } = canvas;
      const ex = Math.round(w * 0.1);
      const ey = Math.round(h * 0.06);
      const edges: [number, number, number, number, number, number, number, number][] = [
        [0, 0, ex, 0, 0, 0, ex, h],
        [w, 0, w - ex, 0, w - ex, 0, ex, h],
        [0, 0, 0, ey, 0, 0, w, ey],
        [0, h, 0, h - ey, 0, h - ey, w, ey],
      ];
      for (const [x0, y0, x1, y1, rx, ry, rw, rh] of edges) {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, bg);
        g.addColorStop(1, `${bg}00`);
        ctx.fillStyle = g;
        ctx.fillRect(rx, ry, rw, rh);
      }
    };

    /** Ближайший загруженный кадр к нужному — пока грузятся остальные, анимация уже идёт. */
    const draw = (share: number) => {
      const want = Math.round(share * (count - 1));
      for (let d = 0; d < count; d++) {
        const i = frames[want - d] ? want - d : frames[want + d] ? want + d : -1;
        if (i < 0) continue;
        if (i !== drawn) {
          ctx.drawImage(frames[i] as HTMLImageElement, 0, 0, canvas.width, canvas.height);
          feather();
          drawn = i;
        }
        return;
      }
    };

    const tick = () => {
      frame = 0;
      const onDesktop = desktop.matches;
      const rect = (onDesktop ? track : sceneTrack).getBoundingClientRect();
      const distance = rect.height - (onDesktop ? window.innerHeight : figureH);
      const p = distance > 0 ? clamp(((onDesktop ? 0 : stickTop) - rect.top) / distance) : 0;
      const share = shareAt(p);

      current = current < 0 ? share : current + (share - current) * (onDesktop ? EASE : EASE_FRAMES);
      if (Math.abs(share - current) < 0.001) current = share;

      const ready = onDesktop ? videoReady : drawn >= 0;
      if (onDesktop) {
        const T = duration();
        if (videoReady && !video.seeking && Math.abs(video.currentTime - current * T) > MIN_STEP) {
          video.currentTime = current * T;
        }
      } else {
        draw(current);
      }
      figure.style.setProperty("--k", ready ? String(clamp((REVEAL_FROM - current) / (REVEAL_FROM - REVEAL_FULL))) : "0");

      if (visible && current !== share) frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(tick);
    };

    // Десктоп: файл целиком в память (blob), перемотка не ждёт сеть.
    const loadVideo = () => {
      if (videoStarted) return;
      videoStarted = true;
      video.preload = "auto";
      fetch(asset(content.video.src))
        .then((r) => r.blob())
        .then((b) => {
          blobUrl = URL.createObjectURL(b);
          video.src = blobUrl;
          video.load();
        })
        .catch(() => {
          video.src = asset(content.video.src);
          video.load();
        });
    };

    // Мобильный: кадры-картинки (~580 КБ). Сначала собранный кадр, потом грубая сетка, потом остальные.
    const loadFrames = () => {
      if (framesStarted) return;
      framesStarted = true;
      const order: number[] = [count - 1, 0];
      for (let step = 16; step >= 1; step /= 2) {
        for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
      }
      for (const i of order) {
        const img = new Image();
        img.decoding = "async";
        img.src = asset(pattern.replace("{i}", String(i).padStart(2, "0")));
        img
          .decode()
          .then(() => {
            frames[i] = img;
            if (drawn < 0 || current < 0) draw(current < 0 ? 1 : current);
            schedule();
          })
          .catch(() => undefined);
      }
    };

    const start = () => {
      if (!mq.matches) return;
      if (desktop.matches) loadVideo();
      else loadFrames();
    };

    // Грузим сразу после загрузки страницы, не дожидаясь подхода к блоку: к моменту скролла всё готово.
    let idle = 0;
    const startWhenIdle = () => {
      idle = window.setTimeout(start, 400);
    };
    if (document.readyState === "complete") startWhenIdle();
    else window.addEventListener("load", startWhenIdle, { once: true });

    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
      },
      { rootMargin: "300% 0px" },
    );
    const onVideoReady = () => {
      videoReady = true;
      measure();
      schedule();
    };
    const watcher = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting) && mq.matches;
      schedule();
    });
    const onResize = () => {
      measure();
      schedule();
    };
    const onModeChange = () => {
      measure();
      start();
      schedule();
    };

    loader.observe(track);
    watcher.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    desktop.addEventListener("change", onModeChange);
    video.addEventListener("loadeddata", onVideoReady);
    video.addEventListener("seeked", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      window.removeEventListener("load", startWhenIdle);
      loader.disconnect();
      watcher.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      desktop.removeEventListener("change", onModeChange);
      video.removeEventListener("loadeddata", onVideoReady);
      video.removeEventListener("seeked", schedule);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [content.video]);

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

        <div ref={sceneTrackRef} className={styles.sceneTrack}>
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
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={video.width}
            height={video.height}
            style={{ backgroundImage: `url(${asset(video.poster)})` }}
            aria-hidden="true"
          />
          <ul className={styles.callouts}>
            {parts.map((part, i) => (
              <Callout key={part.id} part={part} index={i} />
            ))}
          </ul>
        </div>
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
