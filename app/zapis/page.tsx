import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Онлайн-запись" };

export default function ZapisPage() {
  return <PageStub title="Онлайн-запись" chat={3} />;
}
