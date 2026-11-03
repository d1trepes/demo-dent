import { Directions } from "@/components/home/Directions";
import { Hero } from "@/components/home/Hero";
import { PriceUpfront } from "@/components/home/PriceUpfront";

/** Главная собирается по блокам в чатах 2A–2D (docs/DESIGN.md). */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Directions />
      <PriceUpfront />
    </>
  );
}
