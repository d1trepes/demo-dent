"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Option } from "@/components/booking/Option";
import steps from "@/components/booking/Steps.module.css";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox } from "@/components/ui/ConsentCheckbox";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { cx } from "@/lib/cx";
import { clinicNow } from "@/lib/dates";
import { fill, formatCount } from "@/lib/format";
import { PHONE_PLACEHOLDER, formatPhone, isCompletePhone } from "@/lib/phone";
import { staticTexts } from "@/lib/staticTexts";
import type { Branch, TaxCertificatePayload, TaxRequest, VychetContent } from "@/lib/types";
import { useAdminStore } from "@/store/adminStore";
import styles from "./TaxForm.module.css";

type Texts = VychetContent["form"];

const KINSHIP = ["child", "spouse", "parent"] as const;
const YEARS_BACK = 3;

function schemaFor(e: Texts["errors"]) {
  return z
    .object({
      taxpayerName: z.string().trim().regex(/^\S+\s+\S+/, e.name).max(120, e.name),
      taxpayerInn: z.string().regex(/^\d{12}$/, e.inn),
      year: z.string(),
      forRelative: z.boolean(),
      patientName: z.string().trim(),
      kinship: z.enum(KINSHIP),
      method: z.enum(["paper", "fns"]),
      branchId: z.enum(["", "center", "akadem"]),
      phone: z.string().refine(isCompletePhone, e.phone),
      consent: z.boolean().refine((v) => v, e.consent),
    })
    .superRefine((v, ctx) => {
      if (v.forRelative && !/^\S+\s+\S+/.test(v.patientName))
        ctx.addIssue({ code: "custom", path: ["patientName"], message: e.patientName });
      if (v.method === "paper" && !v.branchId) ctx.addIssue({ code: "custom", path: ["branchId"], message: e.branch });
    });
}

type Values = z.infer<ReturnType<typeof schemaFor>>;

/**
 * Заявка на справку для налогового вычета. Медицинских полей нет — согласие на данные о здоровье не нужно.
 * Отправка — createTaxCertificateRequest из lib/api.ts (заглушка), заявка — в adminStore (хранилище заявок демо).
 */
export function TaxForm({ texts, branches }: { texts: Texts; branches: Branch[] }) {
  const addTaxRequest = useAdminStore((s) => s.addTaxRequest);
  const [sent, setSent] = useState<TaxRequest | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const thisYear = Number(clinicNow().date.slice(0, 4));
  const years = Array.from({ length: YEARS_BACK }, (_, i) => String(thisYear - 1 - i));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schemaFor(texts.errors)),
    defaultValues: {
      taxpayerName: "",
      taxpayerInn: "",
      year: years[0],
      forRelative: false,
      patientName: "",
      kinship: "child",
      method: "paper",
      branchId: "",
      phone: "",
      consent: false,
    },
  });
  const [forRelative, method] = useWatch({ control, name: ["forRelative", "method"] });

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  const onSubmit = async (v: Values) => {
    setSubmitError(false);
    const payload: TaxCertificatePayload = {
      taxpayerName: v.taxpayerName.trim(),
      taxpayerInn: v.taxpayerInn,
      year: Number(v.year),
      relation: v.forRelative ? v.kinship : "self",
      patientName: v.forRelative ? v.patientName.trim() : null,
      method: v.method,
      branchId: v.method === "paper" && v.branchId ? v.branchId : null,
      phone: v.phone,
      consents: { personalData: v.consent, health: false, version: staticTexts.consentsVersion },
    };
    try {
      // lib/api.ts тянет все JSON из /data — грузим только при отправке
      const { createTaxCertificateRequest } = await import("@/lib/api");
      const request = await createTaxCertificateRequest(payload);
      addTaxRequest(request);
      setSent(request);
    } catch {
      setSubmitError(true);
    }
  };

  if (sent) {
    const branch = branches.find((b) => b.id === sent.branchId);
    return (
      <div ref={successRef} tabIndex={-1} role="status" className={styles.success}>
        <p className={styles.successTitle}>
          {fill(texts.success, {
            id: sent.id.slice(-6).toUpperCase(),
            days: formatCount(texts.readyDays, texts.dayForms),
          })}
        </p>
        <p className={styles.successText}>{fill(texts.successMethod[sent.method], { branch: branch?.name ?? "" })}</p>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            setSent(null);
          }}
        >
          {texts.again}
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.row}>
        <TextField
          label={texts.taxpayerName}
          autoComplete="name"
          error={errors.taxpayerName?.message}
          {...register("taxpayerName")}
        />
        <Controller
          name="taxpayerInn"
          control={control}
          render={({ field }) => (
            <TextField
              label={texts.taxpayerInn}
              inputMode="numeric"
              placeholder={texts.innHint}
              maxLength={12}
              error={errors.taxpayerInn?.message}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 12))}
            />
          )}
        />
      </div>

      <div className={styles.row}>
        <SelectField label={texts.year} {...register("year")}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </SelectField>
        <div className={styles.group}>
          <span className={styles.label} id="tax-relation">
            {texts.relation}
          </span>
          <div className={cx(steps.segment, styles.segment)} role="group" aria-labelledby="tax-relation">
            {[false, true].map((value) => (
              <button
                key={String(value)}
                type="button"
                className={cx(steps.tab, forRelative === value && steps.tabActive)}
                aria-pressed={forRelative === value}
                onClick={() => setValue("forRelative", value)}
              >
                {value ? texts.relationOther : texts.relationSelf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {forRelative && (
        <div className={styles.row}>
          <TextField label={texts.patientName} error={errors.patientName?.message} {...register("patientName")} />
          <SelectField label={texts.kinship} {...register("kinship")}>
            {texts.kinshipOptions.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.label}>{texts.method}</legend>
        <div className={styles.methods}>
          {texts.methods.map((m) => (
            <Option
              key={m.id}
              selected={method === m.id}
              onClick={() => setValue("method", m.id)}
              title={m.title}
              text={m.text}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        {method === "paper" && (
          <SelectField label={texts.branch} error={errors.branchId?.message} {...register("branchId")}>
            <option value="" disabled>
              {texts.branchPlaceholder}
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.address}
              </option>
            ))}
          </SelectField>
        )}
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              label={texts.phone}
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
        <Button type="submit" disabled={isSubmitting}>
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
