import type { Metadata } from "next";
import { DoctorsView } from "@/components/doctors/DoctorsView";
import { getBranches, getDoctors, getDoctorsPageContent, getSpecialties } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle } = await getDoctorsPageContent();
  return { title: metaTitle };
}

export default async function DoctorsPage() {
  const [texts, doctors, specialties, branches] = await Promise.all([
    getDoctorsPageContent(),
    getDoctors(),
    getSpecialties(),
    getBranches(),
  ]);
  return (
    <DoctorsView
      texts={texts}
      doctors={doctors}
      specialties={specialties}
      branches={branches.map((b) => ({ id: b.id, name: b.name }))}
    />
  );
}
