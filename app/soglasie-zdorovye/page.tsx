import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Согласие на обработку данных о здоровье" };

export default function SoglasieZdorovyePage() {
  return <PageStub title="Согласие на обработку данных о здоровье" chat={5} />;
}
