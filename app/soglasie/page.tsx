import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Согласие на обработку персональных данных" };

export default function SoglasiePage() {
  return <PageStub title="Согласие на обработку персональных данных" chat={5} />;
}
