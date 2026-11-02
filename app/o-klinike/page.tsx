import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";

export const metadata: Metadata = { title: "О клинике" };

export default function OKlinikePage() {
  return <PageStub title="О клинике и сведения о медицинской организации" chat={5} />;
}
