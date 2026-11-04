import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingDone } from "@/components/booking/BookingDone";
import { getBookingData } from "@/lib/bookingData";

export const metadata: Metadata = { title: "Запись создана" };

export default async function ZapisGotovoPage() {
  const data = await getBookingData();
  return (
    <Suspense fallback={null}>
      <BookingDone data={data} />
    </Suspense>
  );
}
