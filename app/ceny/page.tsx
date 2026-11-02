import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";
import { getServices } from "@/lib/api";

export const metadata: Metadata = { title: "Цены" };

export default async function PricesPage() {
  const { items, directions } = await getServices();
  return (
    <PageStub title="Цены" chat={4}>
      <p>
        В прайсе {items.length} позиций по {directions.length} направлениям.
      </p>
    </PageStub>
  );
}
