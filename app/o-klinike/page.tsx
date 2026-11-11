import type { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";
import { getAboutContent, getBranches, getClinic, getDoctors } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getAboutContent();
  return { title: metaTitle };
}

export default async function OKlinikePage() {
  const [content, clinic, branches, doctors] = await Promise.all([getAboutContent(), getClinic(), getBranches(), getDoctors()]);
  return <AboutView content={content} clinic={clinic} branches={branches} doctors={doctors} />;
}
