import type { Metadata } from "next";
import { PromosView } from "@/components/promos/PromosView";
import { getHomeContent, getPromos, getPromosContent } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getPromosContent();
  return { title: metaTitle };
}

export default async function AkciiPage() {
  const [content, promos, { callback }] = await Promise.all([getPromosContent(), getPromos(), getHomeContent()]);
  return <PromosView content={content} promos={promos} callback={callback} />;
}
