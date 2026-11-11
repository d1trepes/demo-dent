"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { fill } from "@/lib/format";
import { PHONE_PLACEHOLDER, formatPhone, isCompletePhone } from "@/lib/phone";
import type { LoginContent } from "@/lib/types";
import { usePatientStore } from "@/store/patientStore";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import styles from "./Login.module.css";

/** /kabinet/vhod/: телефон → код из SMS (в демо 1234) → /kabinet/. Данные никуда не уходят. */
export function LoginView({ texts }: { texts: LoginContent }) {
  const router = useRouter();
  const signIn = usePatientStore((s) => s.signIn);
  const signedIn = usePatientStore((s) => s.profile !== null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (signedIn) router.replace("/kabinet/");
  }, [signedIn, router]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  useEffect(() => {
    if (sent) codeRef.current?.focus();
  }, [sent]);

  const requestCode = async () => {
    if (!isCompletePhone(phone)) return setError(texts.errors.phone);
    setBusy(true);
    setError(null);
    try {
      const { requestSmsCode } = await import("@/lib/api");
      const result = await requestSmsCode(phone);
      setSent(true);
      setLeft(result.retryAfterSec - 1);
    } catch {
      setError(texts.errors.submit);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!/^\d{4}$/.test(code)) return setError(texts.errors.code);
    setBusy(true);
    setError(null);
    try {
      await signIn(phone, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : texts.errors.submit);
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void (sent ? verify() : requestCode());
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <p className={styles.demo}>{texts.demoNote}</p>
          <h1 className={styles.title}>{texts.title}</h1>
          <p className={styles.lead}>{texts.lead}</p>

          {sent ? (
            <>
              <p className={styles.sentTo}>
                {fill(texts.sentTo, { phone })}{" "}
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    setSent(false);
                    setCode("");
                    setError(null);
                  }}
                >
                  {texts.changePhone}
                </button>
              </p>
              <TextField
                ref={codeRef}
                label={texts.codeLabel}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={code}
                error={error ?? undefined}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
              <p className={styles.hint}>{texts.codeHint}</p>
            </>
          ) : (
            <TextField
              label={texts.phoneLabel}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={PHONE_PLACEHOLDER}
              value={phone}
              error={error ?? undefined}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />
          )}

          <Button type="submit" block disabled={busy}>
            {sent ? (busy ? texts.checking : texts.submit) : busy ? texts.sending : texts.getCode}
          </Button>

          {sent && (
            <p className={styles.resend} aria-live="polite">
              {left > 0 ? (
                fill(texts.resendIn, { sec: left })
              ) : (
                <button type="button" className={styles.link} onClick={() => void requestCode()} disabled={busy}>
                  {texts.resend}
                </button>
              )}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
