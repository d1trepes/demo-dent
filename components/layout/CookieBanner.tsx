"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { staticTexts } from "@/lib/staticTexts";
import styles from "./CookieBanner.module.css";

type Choice = "all" | "necessary";
const KEY = "yasen-cookie-consent";
const listeners = new Set<() => void>();

function read(): Choice | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "all" || v === "necessary" ? v : null;
  } catch {
    return null;
  }
}

function save(choice: Choice) {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    /* хранилище недоступно — баннер скроется до перезагрузки */
  }
  memory = choice;
  listeners.forEach((l) => l());
}

let memory: Choice | null = null;
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => memory ?? read();
/** На сервере баннер не рендерим: выбор известен только в браузере. */
const getServerSnapshot = (): Choice | "unknown" => "unknown";

/** Cookie-баннер (152-ФЗ): «Принять» или «Только необходимые». Аналитика — только после «Принять». */
export function CookieBanner() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (choice !== null) return null;

  return (
    <section className={styles.banner} aria-label="Cookie">
      <p className={styles.text}>
        {staticTexts.cookieBanner} <Link href="/privacy/">Политика обработки данных</Link>
      </p>
      <div className={styles.buttons}>
        <button type="button" className={styles.primary} onClick={() => save("all")}>
          Принять
        </button>
        <button type="button" className={styles.secondary} onClick={() => save("necessary")}>
          Только необходимые
        </button>
      </div>
    </section>
  );
}
