import Link from "next/link";
import { bookingHref } from "@/lib/nav";

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
      <h1>Страница не найдена</h1>
      <p>Возможно, ссылка устарела. Начните с главной или сразу запишитесь к врачу.</p>
      <p>
        <Link href="/">На главную</Link> · <Link href={bookingHref}>Записаться</Link>
      </p>
    </div>
  );
}
