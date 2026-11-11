"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Обёртка выпадающего пункта шапки: открыт при наведении и фокусе с клавиатуры.
 * После клика по ссылке закрывается и снимает фокус — не висит поверх новой страницы.
 */
export function NavDropdown({ className, children }: { className: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState({ open: false, path: pathname });
  const open = state.open && state.path === pathname;
  const set = (value: boolean) => setState({ open: value, path: pathname });

  return (
    <div
      className={className}
      data-open={open || undefined}
      onMouseEnter={() => set(true)}
      onMouseLeave={() => set(false)}
      onFocus={() => set(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) set(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          set(false);
          (document.activeElement as HTMLElement | null)?.blur();
        }
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) {
          set(false);
          (document.activeElement as HTMLElement | null)?.blur();
        }
      }}
    >
      {children}
    </div>
  );
}
