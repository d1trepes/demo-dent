import type { Metadata } from "next";
import Link from "next/link";
import { PageStub } from "@/components/ui/PageStub";
import { getServices } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Услуги" };

export default async function ServicesPage() {
  const { directions } = await getServices();
  return (
    <PageStub title="Услуги" chat={4}>
      <ul>
        {directions
          .filter((d) => d.hasPage)
          .map((d) => (
            <li key={d.id}>
              <Link href={`/uslugi/${d.id}/`}>{d.title}</Link> — {formatPrice(d.priceFrom, true)}
            </li>
          ))}
      </ul>
    </PageStub>
  );
}
