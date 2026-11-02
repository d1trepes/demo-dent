import type { Metadata } from "next";
import Link from "next/link";
import { PageStub } from "@/components/ui/PageStub";
import { getDoctors, getSpecialties } from "@/lib/api";

export const metadata: Metadata = { title: "Врачи" };

/** Проверка каркаса: список врачей текстом, данные из data/doctors.json через lib/api.ts. */
export default async function DoctorsPage() {
  const [doctors, specialties] = await Promise.all([getDoctors(), getSpecialties()]);
  const titleOf = new Map(specialties.map((s) => [s.id, s.title]));

  return (
    <PageStub title="Врачи" chat={5}>
      <p>Врачей в базе: {doctors.length}. Данные — из lib/api.ts → getDoctors().</p>
      <ul>
        {doctors.map((d) => (
          <li key={d.id}>
            <Link href={`/vrachi/${d.slug}/`}>{d.fullName}</Link> — {titleOf.get(d.specialty)}, стаж с {d.experienceSince} г.
          </li>
        ))}
      </ul>
    </PageStub>
  );
}
