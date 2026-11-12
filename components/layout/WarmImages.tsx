"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Через сколько после загрузки страницы догружать остальные картинки (первый экран уже грузится сам). */
const DELAY = 300;

/** Ленивые картинки → обычные, все разом после загрузки страницы (8Б): в iOS и Telegram ленивая загрузка
 *  стартует слишком поздно и при скролле видны серые заглушки. Новые картинки (смена страницы, фильтры) — тоже. */
function warm() {
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    // скрытые (display: none — например, листья hero на телефоне) не качаем
    if (img.getClientRects().length > 0) img.loading = "eager";
  });
}

export function WarmImages() {
  const path = usePathname();

  useEffect(() => {
    let timer = 0;
    const run = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(warm, DELAY);
    };
    const observer = new MutationObserver(run);
    const begin = () => {
      run();
      observer.observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", begin);
      observer.disconnect();
    };
  }, [path]);

  return null;
}
