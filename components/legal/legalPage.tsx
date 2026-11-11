import type { Metadata } from "next";
import { getAboutContent, getLegalDoc } from "@/lib/api";
import type { LegalDocId } from "@/lib/types";
import { LegalDocView } from "./LegalDocView";

/** Метаданные и страница юр.текста из legal.json → docs. */
export function legalPage(id: LegalDocId) {
  async function generateMetadata(): Promise<Metadata> {
    const { title } = await getLegalDoc(id);
    return { title };
  }
  async function Page() {
    const [doc, { legalPage: texts }] = await Promise.all([getLegalDoc(id), getAboutContent()]);
    return <LegalDocView doc={doc} texts={texts} />;
  }
  return { generateMetadata, Page };
}
