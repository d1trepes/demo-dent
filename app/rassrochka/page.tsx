import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Рассрочка" };

export default function RassrochkaPage() {
  return <PageStub title="Рассрочка без переплаты" chat={4} />;
}
