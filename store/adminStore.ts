/**
 * Панель администратора: моки из admin.json (через api) + то, что создали в этой демке.
 * Сохраняем только созданное и изменённые статусы — моки каждый раз берутся из api.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Appointment, AppointmentStatus, CallbackRequest, TaxRequest } from "@/lib/types";
import { safeJSONStorage } from "./safeStorage";

type AdminState = {
  /** Записи, созданные в демке (мастер записи). */
  createdAppointments: Appointment[];
  /** Заявки на справки, созданные в демке. */
  createdTaxRequests: TaxRequest[];
  /** Заявки «Перезвоните мне» с главной (2E). */
  createdCallbacks: CallbackRequest[];
  /** Статусы, которые администратор поменял (id → статус), в том числе у моков. */
  statusOverrides: Record<string, AppointmentStatus>;
  addAppointment: (appointment: Appointment) => void;
  addTaxRequest: (request: TaxRequest) => void;
  addCallback: (request: CallbackRequest) => void;
  setStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  /** Перенос записи из кабинета пациента. */
  moveAppointment: (id: string, start: string) => void;
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      createdAppointments: [],
      createdTaxRequests: [],
      createdCallbacks: [],
      statusOverrides: {},
      addAppointment: (appointment) =>
        set((s) => ({ createdAppointments: [appointment, ...s.createdAppointments] })),
      addTaxRequest: (request) => set((s) => ({ createdTaxRequests: [request, ...s.createdTaxRequests] })),
      addCallback: (request) => set((s) => ({ createdCallbacks: [request, ...s.createdCallbacks] })),
      setStatus: async (id, status) => {
        // lib/api.ts тянет все JSON из /data — грузим по требованию, чтобы стор не раздувал бандл страниц
        const { updateAppointmentStatus } = await import("@/lib/api");
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
