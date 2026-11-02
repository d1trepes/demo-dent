import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageStub } from "@/components/ui/PageStub";
import { getDoctor, getDoctors } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const doctors = await getDoctors();
  return doctors.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doctor = await getDoctor((await params).slug);
  return { title: doctor ? doctor.fullName : "Врач" };
}

export default async function DoctorPage({ params }: Props) {
  const doctor = await getDoctor((await params).slug);
  if (!doctor) notFound();
  return (
    <PageStub title={doctor.fullName} chat={5}>
      <p>{doctor.position}</p>
    </PageStub>
  );
}
