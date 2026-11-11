import type { Metadata } from "next";
import { CabinetView } from "@/components/kabinet/CabinetView";
import { getKabinetContent } from "@/lib/api";
import { getBookingData } from "@/lib/bookingData";

export async function generateMetadata(): Promise<Metadata> {
  const { cabinet } = await getKabinetContent();
  return { title: cabinet.metaTitle };
}

export default async function KabinetPage() {
  const [{ cabinet }, data] = await Promise.all([getKabinetContent(), getBookingData()]);
  return <CabinetView texts={cabinet} data={data} />;
}
