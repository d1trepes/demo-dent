import type { Metadata } from "next";
import { RassrochkaView } from "@/components/rassrochka/RassrochkaView";
import { getHomeContent, getInstallmentTerms, getRassrochkaContent } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getRassrochkaContent();
  return { title: metaTitle };
}

export default async function RassrochkaPage() {
  const [content, terms, { callback }] = await Promise.all([getRassrochkaContent(), getInstallmentTerms(), getHomeContent()]);
  return <RassrochkaView content={content} terms={terms} callback={callback} />;
}
