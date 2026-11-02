import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Панель администратора" };

export default function AdminPage() {
  return <PageStub title="Панель администратора" chat={7} />;
}
