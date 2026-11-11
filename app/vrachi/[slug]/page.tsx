import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DoctorProfile } from "@/components/doctors/DoctorProfile";
import { fill } from "@/lib/format";
import {
  getBranches,
  getDoctor,
  getDoctors,
  getDoctorsPageContent,
  getHomeContent,
  getServices,
  getSpecialties,
} from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const doctors = await getDoctors();
  return doctors.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [doctor, specialties, { profile }] = await Promise.all([
    getDoctor((await params).slug),
    getSpecialties(),
    getDoctorsPageContent(),
  ]);
  if (!doctor) return {};
  const specialty = specialties.find((s) => s.id === doctor.specialty)?.title ?? "";
  return { title: fill(profile.metaTitle, { name: doctor.fullName, specialty }) };
}

export default async function DoctorPage({ params }: Props) {
  const doctor = await getDoctor((await params).slug);
  if (!doctor) notFound();
  const [specialties, branches, { directions }, { profile }, { callback }] = await Promise.all([
    getSpecialties(),
    getBranches(),
    getServices(),
    getDoctorsPageContent(),
    getHomeContent(),
  ]);
  return (
    <DoctorProfile
      doctor={doctor}
      specialty={specialties.find((s) => s.id === doctor.specialty)?.title ?? ""}
      branches={branches}
      directions={directions}
      texts={profile}
      callback={callback}
    />
  );
}
