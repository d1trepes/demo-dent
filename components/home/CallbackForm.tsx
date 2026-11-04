"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { clinicNow } from "@/lib/dates";
import { PHONE_PLACEHOLDER, formatPhone, isCompletePhone } from "@/lib/phone";
import { staticTexts } from "@/lib/staticTexts";
import type { HomeCallback } from "@/lib/types";
import { useAdminStore } from "@/store/adminStore";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConsentCheckbox } from "@/components/ui/ConsentCheckbox";
import { TextField } from "@/components/ui/TextField";
import styles from "./Callback.module.css";

type Texts = Omit<HomeCallback, "title" | "subtitle" | "photo">;
type Source = { page: string; label: string };

const HOME_SOURCE: Source = { page: "/", label: "Главная — «Перезвоните мне»" };

function schemaFor(errors: HomeCallback["errors"]) {
  return z.object({
    name: z.string().trim().min(2, errors.name).max(60, errors.name),
    phone: z.string().refine(isCompletePhone, errors.phone),
    consent: z.boolean().refine((v) => v, errors.consent),
  });
}

type Values = z.infer<ReturnType<typeof schemaFor>>;

/**
 * Форма «Перезвоните мне» (блок 8): имя, телефон, отдельное согласие на ПДн.
 * Повода и свободного текста нет — согласие на данные о здоровье не нужно.
 * Отправка — только createCallbackRequest из lib/api.ts (заглушка), заявка — в adminStore для /admin/.
 * source — откуда пришла заявка (по умолчанию главная; /rassrochka/ передаёт свою).
 */
export function CallbackForm({ texts, source = HOME_SOURCE }: { texts: Texts; source?: Source }) {
  const addCallback = useAdminStore((s) => s.addCallback);
  const [sentName, setSentName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schemaFor(texts.errors)),
    defaultValues: { name: "", phone: "", consent: false },
  });

  useEffect(() => {
    if (sentName !== null) successRef.current?.focus();
  }, [sentName]);

  const onSubmit = async (values: Values) => {
    setSubmitError(false);
    const payload = { name: values.name.trim(), phone: values.phone, consentVersion: staticTexts.consentsVersion };
    try {
      // lib/api.ts тянет все JSON из /data — грузим только при отправке, а не вместе с главной
      const { createCallbackRequest } = await import("@/lib/api");
      const result = await createCallbackRequest(payload);
      const now = clinicNow();
      addCallback({
        ...payload,
        id: result.id,
        status: result.status,
        createdAt: `${now.date}T${now.time}`,
        source,
      });
      setSentName(payload.name);
    } catch {
      setSubmitError(true);
    }
  };

  if (sentName !== null) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className={styles.success}>
        <p className={styles.successText}>{texts.success.replace("{name}", sentName)}</p>
        <ButtonLink href={texts.bookOnline.href} variant="secondary">
          {texts.bookOnline.label}
        </ButtonLink>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.fields}>
        <TextField
          label={texts.nameLabel}
          autoComplete="given-name"
          enterKeyHint="next"
          error={errors.name?.message}
          {...register("name")}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              label={texts.phoneLabel}
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

      <ConsentCheckbox
        label={texts.consentLabel}
        docHref="/soglasie/"
        docLabel={texts.consentDocLabel}
        policyHref="/privacy/"
        policyLabel={texts.policyLabel}
        error={errors.consent?.message}
        {...register("consent")}
      />

      <div className={styles.actions}>
        <Button type="submit" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting ? texts.sending : texts.submit}
        </Button>
        {submitError && (
          <p role="alert" className={styles.submitError}>
            {texts.errors.submit}
          </p>
        )}
      </div>
    </form>
  );
}
