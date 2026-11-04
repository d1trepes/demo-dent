import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageStub } from "@/components/ui/PageStub";
import { getService, getServiceSlugs } from "@/lib/api";

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
  return (
    <PageStub title={service.page.title} chat={4}>
      <p>{service.page.lead}</p>
    </PageStub>
  );
}
