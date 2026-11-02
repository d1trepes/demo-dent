import type { Metadata } from "next";
import { PageStub } from "@/components/ui/PageStub";
import { getLegal } from "@/lib/api";
import { asset } from "@/lib/asset";

export const metadata: Metadata = { title: "Документы" };

export default async function DocumentsPage() {
  const { clinicDocuments } = await getLegal();
  return (
    <PageStub title="Документы и лицензия" chat={5}>
      <ul>
        {clinicDocuments.map((d) => (
          <li key={d.id}>
            <a href={asset(d.file)}>{d.title}</a> (PDF)
          </li>
        ))}
      </ul>
    </PageStub>
  );
}
