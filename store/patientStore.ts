/**
 * Кабинет демо-пациента: «вход» по коду 1234, записи, план лечения, напоминания.
 * В бою сессия живёт в cookie, а данные приходят из МИС (docs/HANDOFF.md → кабинет).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cancelAppointment,
  getAppointments,
  getReminderSettings,
  getTreatmentPlan,
  payPlanStage,
  rescheduleAppointment,
  updateReminderSettings,
  verifySmsCode,
} from "@/lib/api";
import type { Appointment, PatientProfile, ReminderSettings, Slot, TreatmentPlan } from "@/lib/types";
import { useAdminStore } from "./adminStore";
import { safeJSONStorage } from "./safeStorage";

type PatientState = {
  profile: PatientProfile | null;
  /** Записи пациента: из api при входе + созданные в мастере записи. */
  appointments: Appointment[];
  plan: TreatmentPlan | null;
  reminders: ReminderSettings | null;
  signIn: (phone: string, code: string) => Promise<void>;
  signOut: () => void;
  addAppointment: (appointment: Appointment) => void;
  reschedule: (id: string, slot: Slot) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  payStage: (stageId: string) => Promise<void>;
  setReminders: (settings: ReminderSettings) => Promise<void>;
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      profile: null,
      appointments: [],
      plan: null,
      reminders: null,
      signIn: async (phone, code) => {
        const profile = await verifySmsCode(phone, code);
        const [seeded, plan, reminders] = await Promise.all([getAppointments(), getTreatmentPlan(), getReminderSettings()]);
        const known = new Set(get().appointments.map((a) => a.id));
        set((s) => ({
          profile,
          plan,
          reminders,
          appointments: [...s.appointments, ...seeded.filter((a) => !known.has(a.id))],
        }));
      },
      signOut: () => set({ profile: null, plan: null, reminders: null, appointments: [] }),
      addAppointment: (appointment) => set((s) => ({ appointments: [appointment, ...s.appointments] })),
      reschedule: async (id, slot) => {
        const result = await rescheduleAppointment(id, slot);
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id
              ? { ...a, start: result.start, status: result.status, doctorId: slot.doctorId, branchId: slot.branchId }
              : a,
          ),
        }));
        useAdminStore.getState().moveAppointment(id, result.start);
      },
      cancel: async (id) => {
        const result = await cancelAppointment(id);
        set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: result.status } : a)) }));
        await useAdminStore.getState().setStatus(id, result.status);
      },
      payStage: async (stageId) => {
        await payPlanStage(stageId);
        set((s) => {
          if (!s.plan) return {};
          const stages = s.plan.stages.map((st) => (st.id === stageId ? { ...st, paid: true } : st));
          return { plan: { ...s.plan, stages, paid: stages.filter((st) => st.paid).reduce((sum, st) => sum + st.sum, 0) } };
        });
      },
      setReminders: async (settings) => {
        set({ reminders: await updateReminderSettings(settings) });
      },
    }),
    { name: "yasen-patient", storage: safeJSONStorage, version: 1 },
  ),
);
