import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { PHONE_PLACEHOLDER, formatPhone, isCompletePhone } from "@/lib/phone";
import type { BookingContent } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox } from "@/components/ui/ConsentCheckbox";
import { TextField } from "@/components/ui/TextField";
import styles from "./Steps.module.css";

export const CONTACTS_FORM_ID = "booking-contacts";

function schemaFor(errors: BookingContent["contacts"]["errors"], needHealth: boolean) {
  return z.object({
    name: z.string().trim().min(2, errors.name).max(60, errors.name),
    phone: z.string().refine(isCompletePhone, errors.phone),
    personal: z.boolean().refine((v) => v, errors.personal),
    health: z.boolean().refine((v) => !needHealth || v, errors.health),
  });
}

type Values = z.infer<ReturnType<typeof schemaFor>>;

type Props = {
  content: BookingContent;
  draft: BookingDraft;
  /** Медицинский повод → второй, отдельный чекбокс (152-ФЗ ст. 10). */
  needHealth: boolean;
  errorCode: string | null;
  update: (patch: Partial<BookingDraft>) => void;
  /** Заполнено и согласия отмечены — отправляем запись. */
  onSubmit: () => void;
  onChooseOtherTime: () => void;
};

/** Шаг 4: имя, телефон и согласия. Свободного поля для жалоб нет — повод выбирается из списка на шаге 1. */
export function StepContacts({ content, draft, needHealth, errorCode, update, onSubmit, onChooseOtherTime }: Props) {
  const t = content.contacts;
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    mode: "onTouched",
    resolver: zodResolver(schemaFor(t.errors, needHealth)),
    defaultValues: { name: draft.name, phone: draft.phone, personal: draft.consentPersonalData, health: draft.consentHealth },
  });

  // Введённое сразу попадает в стор: при «Назад» и возврате поля не очищаются
  useEffect(() => {
    const subscription = watch((v) =>
      update({
        name: v.name ?? "",
        phone: v.phone ?? "",
        consentPersonalData: Boolean(v.personal),
        consentHealth: Boolean(v.health),
      }),
    );
    return () => subscription.unsubscribe();
  }, [watch, update]);

  return (
    <form id={CONTACTS_FORM_ID} className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className={styles.hint}>{t.lead}</p>
      <div className={styles.fields}>
        <TextField label={t.nameLabel} autoComplete="given-name" enterKeyHint="next" error={errors.name?.message} {...register("name")} />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              label={t.phoneLabel}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={PHONE_PLACEHOLDER}
              error={errors.phone?.message}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
            />
          )}
        />
      </div>

      <div className={styles.consents}>
        <ConsentCheckbox
          label={t.personal.label}
          docHref="/soglasie/"
          docLabel={t.personal.docLabel}
          policyHref="/privacy/"
          policyLabel={t.personal.policyLabel}
          error={errors.personal?.message}
          {...register("personal")}
        />
        {needHealth && (
          <div>
            <ConsentCheckbox
              label={t.health.label}
              docHref="/soglasie-zdorovye/"
              docLabel={t.health.docLabel}
              error={errors.health?.message}
              {...register("health")}
            />
            <p className={styles.hint}>{t.health.hint}</p>
          </div>
        )}
      </div>

      {errorCode && (
        <div role="alert" className={styles.alert}>
          <p>{errorCode === "slot_taken" ? t.slotTaken : t.errors.submit}</p>
          {errorCode === "slot_taken" && (
            <Button variant="secondary" onClick={onChooseOtherTime}>
              {t.chooseOther}
            </Button>
          )}
        </div>
      )}
      <p className={styles.note}>{t.demoNote}</p>
    </form>
  );
}
