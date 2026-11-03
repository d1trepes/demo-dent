"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = { href: string; className: string; children: ReactNode };

/** Пункт меню шапки: текущий раздел получает aria-current="page" (по нему же — стиль «стекло»). */
export function NavLink({ href, className, children }: Props) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link href={href} className={className} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
