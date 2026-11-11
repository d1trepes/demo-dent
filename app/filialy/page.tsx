import type { Metadata } from "next";
import { BranchesView } from "@/components/branches/BranchesView";
import { getBranches, getBranchesPageContent, getHomeContent, getReviews } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getBranchesPageContent();
  return { title: metaTitle };
}

export default async function FilialyPage() {
  const [content, branches, reviews, { callback }] = await Promise.all([
    getBranchesPageContent(),
    getBranches(),
    getReviews(),
    getHomeContent(),
  ]);
  return <BranchesView content={content} branches={branches} reviews={reviews} callback={callback} />;
}
