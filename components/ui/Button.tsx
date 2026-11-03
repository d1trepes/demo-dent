import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

/**
 * Одна система кнопок на весь сайт (docs/DESIGN.md):
 * primary — заливка кобальтом, secondary — обводка 1 px. Высота 56, скругление 999.
 * Никаких стрелок и иконок внутри.
 */
export type ButtonVariant = "primary" | "secondary";

type Common = {
  variant?: ButtonVariant;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

/** Классы кнопки для обычной ссылки <a> (tel:, внешние адреса). */
export function buttonClass({ variant = "primary", block, className }: Omit<Common, "children"> = {}) {
  return cx(styles.button, styles[variant], block && styles.block, className);
}

export function ButtonLink({
  href,
  variant,
  block,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={buttonClass({ variant, block, className })} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  block,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass({ variant, block, className })} {...rest}>
      {children}
    </button>
  );
}
