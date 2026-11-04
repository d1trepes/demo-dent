import { asset } from "@/lib/asset";
import { initials } from "@/lib/format";
import styles from "./Steps.module.css";

/**
 * Портрет врача кружком. Фото есть не у всех (docs/PROGRESS.md): если файла нет — инициалы.
 * Проверяем onError, а не список файлов, чтобы новые портреты подхватывались сами.
 */
export function Avatar({ fullName, photo }: { fullName: string; photo: string }) {
  return (
    <span className={styles.avatar} aria-hidden>
      <span className={styles.avatarInitials}>{initials(fullName)}</span>
      <img
        src={asset(photo)}
        alt=""
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}
