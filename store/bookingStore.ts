/**
 * Мастер онлайн-записи (4 шага). Черновик не сохраняется между перезагрузками —
 * так проще с согласиями: их всегда ставят заново.
 * Созданная запись попадает в кабинет пациента и в панель администратора.
 */
import { create } from "zustand";
import { createAppointment } from "@/lib/api";
import { clinicNow } from "@/lib/dates";
import type { Appointment, AppointmentSource, BranchId, Slot } from "@/lib/types";
import { useAdminStore } from "./adminStore";
import { usePatientStore } from "./patientStore";

export type BookingMode = "planned" | "unknown" | "urgent";
export type BookingStep = 1 | 2 | 3 | 4;

type Draft = {
  mode: BookingMode;
  step: BookingStep;
  directionId: string | null;
  serviceId: string | null;
  reasonId: string | null;
  branchId: BranchId | null;
  doctorId: string | null;
  slot: Slot | null;
  name: string;
  phone: string;
  consentPersonalData: boolean;
  consentHealth: boolean;
  source: AppointmentSource;
};

type BookingState = Draft & {
  submitting: boolean;
  error: string | null;
  lastAppointmentId: string | null;
  /** Предзаполнение из URL: ?service= &doctor= &branch= и режим. */
  start: (init: Partial<Draft>) => void;
  update: (patch: Partial<Draft>) => void;
  goTo: (step: BookingStep) => void;
  /** consentsVersion — версия текстов из legal.json. */
  submit: (consentsVersion: string) => Promise<string | null>;
  reset: () => void;
};

const initialDraft: Draft = {
  mode: "planned",
  step: 1,
  directionId: null,
  serviceId: null,
  reasonId: null,
  branchId: null,
  doctorId: null,
  slot: null,
  name: "",
  phone: "",
  consentPersonalData: false,
  consentHealth: false,
  source: { page: "/zapis/", label: "Онлайн-запись" },
};

export const useBookingStore = create<BookingState>()((set, get) => ({
  ...initialDraft,
  submitting: false,
  error: null,
  lastAppointmentId: null,
  start: (init) => set({ ...initialDraft, ...init, error: null }),
  update: (patch) => set({ ...patch, error: null }),
  goTo: (step) => set({ step }),
  submit: async (consentsVersion) => {
    const d = get();
    if (!d.slot || !d.directionId) {
      set({ error: "Выберите услугу и время" });
      return null;
    }
    set({ submitting: true, error: null });
    try {
      const result = await createAppointment({
        directionId: d.directionId,
        serviceId: d.serviceId ?? undefined,
        reasonId: d.reasonId ?? undefined,
        doctorId: d.slot.doctorId,
        branchId: d.slot.branchId,
        start: d.slot.start,
        urgent: d.mode === "urgent",
        patient: { name: d.name, phone: d.phone },
        consents: { personalData: d.consentPersonalData, health: d.consentHealth, version: consentsVersion },
        source: d.source,
      });
      const now = clinicNow();
      const appointment: Appointment = {
        id: result.id,
        status: result.status,
        createdAt: `${now.date}T${now.time}`,
        directionId: d.directionId,
        serviceId: d.serviceId ?? undefined,
        reasonId: d.reasonId ?? undefined,
        doctorId: d.slot.doctorId,
        branchId: d.slot.branchId,
        start: d.slot.start,
        durationMin: d.slot.durationMin,
        urgent: d.mode === "urgent",
        patient: { name: d.name, phone: d.phone },
        source: d.source,
      };
      useAdminStore.getState().addAppointment(appointment);
      usePatientStore.getState().addAppointment(appointment);
      set({ ...initialDraft, submitting: false, lastAppointmentId: result.id });
      return result.id;
    } catch (e) {
      set({ submitting: false, error: e instanceof Error ? e.message : "Не удалось записаться" });
      return null;
    }
  },
  reset: () => set({ ...initialDraft, error: null }),
}));
