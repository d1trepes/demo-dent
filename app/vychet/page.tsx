import type { Metadata } from "next";
import { VychetView } from "@/components/vychet/VychetView";
import { getBranches, getHomeContent, getVychetContent } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getVychetContent();
  return { title: metaTitle };
}

export default async function VychetPage() {
  const [content, branches, { callback }] = await Promise.all([getVychetContent(), getBranches(), getHomeContent()]);
  return <VychetView content={content} branches={branches} callback={callback} />;
}
