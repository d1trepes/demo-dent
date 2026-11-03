import type { Metadata, Viewport } from "next";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBar } from "@/components/layout/MobileBar";
import "@fontsource/prata/400.css";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@/styles/globals.css";

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
        <Footer />
        <MobileBar />
        <CookieBanner />
      </body>
    </html>
  );
}
