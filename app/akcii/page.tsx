import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "Акции" };

export default function AkciiPage() {
  return <PageStub title="Акции" chat={4} />;
}
