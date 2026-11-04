import type { Metadata } from "next";
import { ServicesView } from "@/components/services/ServicesView";
import { getBranches, getClinic, getServices, getServicesIndexContent } from "@/lib/api";
import { resolveServiceCards } from "@/lib/servicesIndex";

export const metadata: Metadata = { title: "Услуги" };

export default async function ServicesPage() {
  const [{ cards, ...texts }, { directions, items }, clinic, branches] = await Promise.all([
    getServicesIndexContent(),
    getServices(),
    getClinic(),
    getBranches(),
  ]);
  return (
    <ServicesView
      texts={texts}
      cards={resolveServiceCards(cards, directions, items)}
      branches={branches.map((b) => ({ id: b.id, name: b.name }))}
      phone={{ text: clinic.phone, href: clinic.phoneHref }}
    />
  );
}
