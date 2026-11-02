import Link from "next/link";
import { Phone, CalendarCheck } from "lucide-react";
import { getClinic } from "@/lib/api";
import { bookingHref } from "@/lib/nav";
import styles from "./MobileBar.module.css";

/** Постоянная нижняя панель на мобильных: «Позвонить | Записаться». */
export async function MobileBar() {
  const clinic = await getClinic();
  return (
    <div className={styles.bar}>
      <a href={clinic.phoneHref} className={styles.call}>
        <Phone aria-hidden size={20} />
        Позвонить
      </a>
      <Link href={bookingHref} className={styles.book}>
        <CalendarCheck aria-hidden size={20} />
        Записаться
      </Link>
    </div>
  );
}
