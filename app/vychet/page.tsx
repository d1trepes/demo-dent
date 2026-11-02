import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Налоговый вычет" };

export default function VychetPage() {
  return <PageStub title="Налоговый вычет за лечение" chat={5} />;
}
