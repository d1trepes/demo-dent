import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

/**
 * primary — синяя на светлом; light — белая на синем; outline / outlineLight — контурные.
 * size: md (44 px) или lg (56 px) для первого экрана.
 */
export type ButtonVariant = "primary" | "light" | "outline" | "outlineLight";
type Common = {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  /** Стрелка ↗ после текста — фирменный приём для действий. */
  arrow?: boolean;
  icon?: ReactNode;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

function classes({ variant = "primary", size = "md", block, className }: Omit<Common, "children">) {
  return cx(styles.button, styles[variant], size === "lg" && styles.lg, block && styles.block, className);
}

function Content({ icon, arrow, children }: Pick<Common, "icon" | "arrow" | "children">) {
  return (
    <>
      {icon}
      <span>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden>
          <ArrowUpRight size={18} strokeWidth={2} />
        </span>
      )}
    </>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  arrow,
  icon,
  block,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={classes({ variant, size, block, className })} {...rest}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </Link>
  );
}

export function Button({
  variant,
  size,
  arrow,
  icon,
  block,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={classes({ variant, size, block, className })} {...rest}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </button>
  );
}
