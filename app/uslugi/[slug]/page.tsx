import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceView } from "@/components/service/ServiceView";
import { getHomeContent, getService, getServicePageTexts, getServiceSlugs } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  return { title: service ? service.page.title : "Услуга" };
}

export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const [texts, home] = await Promise.all([getServicePageTexts(), getHomeContent()]);
  return <ServiceView service={service} texts={texts} callback={home.callback} />;
}
