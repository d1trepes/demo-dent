/**
 * Панель администратора: моки из admin.json (через api) + то, что создали в этой демке.
 * Сохраняем только созданное и изменённые статусы — моки каждый раз берутся из api.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateAppointmentStatus } from "@/lib/api";
import type { Appointment, AppointmentStatus, TaxRequest } from "@/lib/types";
import { safeJSONStorage } from "./safeStorage";

type AdminState = {
  /** Записи, созданные в демке (мастер записи). */
  createdAppointments: Appointment[];
  /** Заявки на справки, созданные в демке. */
  createdTaxRequests: TaxRequest[];
  /** Статусы, которые администратор поменял (id → статус), в том числе у моков. */
  statusOverrides: Record<string, AppointmentStatus>;
  addAppointment: (appointment: Appointment) => void;
  addTaxRequest: (request: TaxRequest) => void;
  setStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  /** Перенос записи из кабинета пациента. */
  moveAppointment: (id: string, start: string) => void;
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      createdAppointments: [],
      createdTaxRequests: [],
      statusOverrides: {},
      addAppointment: (appointment) =>
        set((s) => ({ createdAppointments: [appointment, ...s.createdAppointments] })),
      addTaxRequest: (request) => set((s) => ({ createdTaxRequests: [request, ...s.createdTaxRequests] })),
      setStatus: async (id, status) => {
        const result = await updateAppointmentStatus(id, status);
        set((s) => ({ statusOverrides: { ...s.statusOverrides, [result.id]: result.status } }));
      },
      moveAppointment: (id, start) =>
        set((s) => ({
          createdAppointments: s.createdAppointments.map((a) =>
            a.id === id ? { ...a, start, status: "rescheduled" } : a,
          ),
        })),
    }),
    { name: "yasen-admin", storage: safeJSONStorage, version: 1 },
  ),
);

/** Список для экрана: созданные + моки, с учётом изменённых статусов. */
export function mergeAppointments(
  mocks: Appointment[],
  created: Appointment[],
  overrides: Record<string, AppointmentStatus>,
): Appointment[] {
  return [...created, ...mocks]
    .map((a) => (overrides[a.id] ? { ...a, status: overrides[a.id] } : a))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
