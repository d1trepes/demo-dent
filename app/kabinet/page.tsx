import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Личный кабинет" };

export default function KabinetPage() {
  return <PageStub title="Личный кабинет" chat={6} />;
}
