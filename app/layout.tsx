import type { Metadata, Viewport } from "next";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { FooterSlim } from "@/components/layout/FooterSlim";
import { PathGate } from "@/components/layout/PathGate";
import { Header } from "@/components/layout/Header";
import "@fontsource/prata/400.css";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@/styles/globals.css";

/** Экраны-задачи без подвала и нижней панели: мастер записи и вход в кабинет. */
const WORK_SCREENS = ["/zapis/", "/kabinet/vhod/"];

export const metadata: Metadata = {
  title: {
    default: "Семейная стоматология «Ясень» — Екатеринбург",
    template: "%s — стоматология «Ясень»",
  },
  description:
    "Лечим всей семьёй и без сюрпризов в цене: онлайн-запись к врачу, план лечения с итоговой суммой, приём в выходные. Демо-проект студии, клиника вымышлена.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#f3f4f8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a href="#main" className="skip-link">
          К содержанию
        </a>
        <Header />
        <main id="main">{children}</main>
        <PathGate paths={WORK_SCREENS} mode="except">
          <Footer />
        </PathGate>
        <PathGate paths={WORK_SCREENS} mode="on">
          <FooterSlim />
        </PathGate>
        <CookieBanner />
      </body>
    </html>
  );
}
