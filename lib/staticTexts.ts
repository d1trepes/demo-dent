/**
 * Статичные юридические тексты, которые нужны клиентским компонентам синхронно
 * (плашка противопоказаний, cookie-баннер, версия согласий). Отдельный модуль,
 * чтобы в браузер не попадал весь lib/api.ts с данными. Это не «серверные» данные:
 * в бою тексты остаются в сборке.
 */
import legal from "@/data/legal.json";

export const staticTexts = {
  contraindications: legal.contraindications,
  cookieBanner: legal.cookieBanner,
  consentsVersion: legal.version,
} as const;
