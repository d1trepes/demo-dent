import type { Metadata } from "next";
import { PricesView } from "@/components/prices/PricesView";
import { getClinic, getPricesContent, getServices } from "@/lib/api";

export const metadata: Metadata = { title: "Цены" };

export default async function PricesPage() {
  const [{ items, directions }, texts, clinic] = await Promise.all([getServices(), getPricesContent(), getClinic()]);
  return <PricesView directions={directions} items={items} texts={texts} phone={{ text: clinic.phone, href: clinic.phoneHref }} />;
}
