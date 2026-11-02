import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Запись создана" };

export default function ZapisGotovoPage() {
  return <PageStub title="Запись создана" chat={3} />;
}
