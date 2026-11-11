import type { Metadata } from "next";
import { DocumentsView } from "@/components/about/DocumentsView";
import { getAboutContent, getLegal } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { documents } = await getAboutContent();
  return { title: documents.metaTitle };
}

export default async function DocumentsPage() {
  const [{ documents }, { clinicDocuments, docs }] = await Promise.all([getAboutContent(), getLegal()]);
  return <DocumentsView texts={documents} files={clinicDocuments} legalDocs={docs} />;
}
