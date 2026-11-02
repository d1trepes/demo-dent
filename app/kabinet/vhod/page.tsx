import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Вход в кабинет" };

export default function KabinetVhodPage() {
  return <PageStub title="Вход в личный кабинет" chat={6} />;
}
