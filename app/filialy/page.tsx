import type { Metadata } from "next";
import { BranchesView } from "@/components/branches/BranchesView";
import { getBranches, getBranchesPageContent, getHomeContent } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getBranchesPageContent();
  return { title: metaTitle };
}

export default async function FilialyPage() {
  const [content, branches, { callback }] = await Promise.all([
    getBranchesPageContent(),
    getBranches(),
    getHomeContent(),
  ]);
  return <BranchesView content={content} branches={branches} callback={callback} />;
}
