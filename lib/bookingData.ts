/**
 * Данные для мастера записи и страницы «Запись создана»: собираются на сервере при сборке
 * через lib/api.ts и уходят в клиентские компоненты пропсами — так мастер не ждёт «сервер» при открытии.
 */
import { getBookingContent, getBranches, getDoctors, getInstallmentTerms, getReasons, getServices, getSpecialties } from "./api";
import { staticTexts } from "./staticTexts";
import type { BookingData } from "./types";

export async function getBookingData(): Promise<BookingData> {
  const [services, reasons, branches, doctors, specialties, content, installment] = await Promise.all([
    getServices(),
    getReasons(),
    getBranches(),
    getDoctors(),
    getSpecialties(),
    getBookingContent(),
    getInstallmentTerms(),
  ]);
  return {
    directions: services.directions,
    items: services.items.map(({ id, directionId, title, price, priceIsFrom, durationMin }) => ({
      id,
      directionId,
      title,
      price,
      priceIsFrom,
      durationMin,
    })),
    reasons,
    branches,
    doctors: doctors.map(({ id, slug, fullName, specialty, position, experienceSince, branches: doctorBranches, directions, acceptsKids, photo }) => ({
      id,
      slug,
      fullName,
      specialty,
      position,
      experienceSince,
      branches: doctorBranches,
      directions,
      acceptsKids,
      photo,
    })),
    specialties,
    installment,
    consentsVersion: staticTexts.consentsVersion,
    content,
  };
}
