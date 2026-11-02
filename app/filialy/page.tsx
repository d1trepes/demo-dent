import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Филиалы" };

export default function FilialyPage() {
  return <PageStub title="Филиалы" chat={5} />;
}
