import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Политика обработки персональных данных" };

export default function PrivacyPage() {
  return <PageStub title="Политика обработки персональных данных" chat={5} />;
}
