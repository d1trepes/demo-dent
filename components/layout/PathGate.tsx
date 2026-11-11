"use client";

import { usePathname } from "next/navigation";

/** Показывает children только на путях из `on` (или везде, кроме них, при `except`). Пути — с завершающим «/». */
export function PathGate({ paths, mode, children }: { paths: string[]; mode: "on" | "except"; children: React.ReactNode }) {
  const raw = usePathname() ?? "/";
  const path = raw.endsWith("/") ? raw : `${raw}/`;
  const match = paths.some((p) => path === p || path.startsWith(p));
  return (mode === "on") === match ? <>{children}</> : null;
}
