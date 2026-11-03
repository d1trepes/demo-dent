import { getClinic } from "@/lib/api";
import { bookingHref } from "@/lib/nav";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import styles from "./MobileBar.module.css";

/** Постоянная нижняя панель на мобильных: «Позвонить | Записаться». Кнопки — общей системы, без иконок. */
export async function MobileBar() {
  const clinic = await getClinic();
  return (
    <div className={styles.bar}>
      <a href={clinic.phoneHref} className={buttonClass({ variant: "secondary", block: true })}>
        Позвонить
      </a>
      <ButtonLink href={bookingHref} block>
        Записаться
      </ButtonLink>
    </div>
  );
}
