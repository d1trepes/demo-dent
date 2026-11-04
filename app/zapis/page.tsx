import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBookingData } from "@/lib/bookingData";

export const metadata: Metadata = { title: "Онлайн-запись" };

export default async function ZapisPage() {
  const data = await getBookingData();
  // useSearchParams в статичном экспорте требует Suspense
  return (
    <Suspense fallback={null}>
      <BookingWizard data={data} />
    </Suspense>
  );
}
