import { BeforeAfter } from "@/components/home/BeforeAfter";
import { Branches } from "@/components/home/Branches";
import { Doctors } from "@/components/home/Doctors";
import { Directions } from "@/components/home/Directions";
import { Hero } from "@/components/home/Hero";
import { Implant } from "@/components/home/Implant";
import { PriceUpfront } from "@/components/home/PriceUpfront";

/** Главная собирается по блокам в чатах 2A–2E (docs/DESIGN.md). */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Directions />
      <PriceUpfront />
      <Implant />
      <Doctors />
      <BeforeAfter />
      <Branches />
    </>
  );
}
