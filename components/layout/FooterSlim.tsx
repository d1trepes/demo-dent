import { getClinic } from "@/lib/api";
import { formatDate } from "@/lib/format";
import styles from "./Footer.module.css";

/** Тонкая строка вместо подвала на «рабочих» экранах (запись, вход): реквизиты, лицензия, пометка «демо». */
export async function FooterSlim() {
  const clinic = await getClinic();
  return (
    <footer className={`container ${styles.slim}`}>
      <p>
        {clinic.legalName}, ИНН {clinic.inn} · Лицензия № {clinic.license.number} от {formatDate(clinic.license.date)}
      </p>
      <p>{clinic.demoNote}</p>
    </footer>
  );
}
