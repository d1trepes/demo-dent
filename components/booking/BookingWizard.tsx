"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import type { BookingData, Reason } from "@/lib/types";
import { useBookingStore, type BookingStep } from "@/store/bookingStore";
import { Button } from "@/components/ui/Button";
import { initFromParams } from "./init";
import { Progress, type ProgressItem } from "./Progress";
import { StepContacts, CONTACTS_FORM_ID } from "./StepContacts";
import { StepPlace } from "./StepPlace";
import { StepService } from "./StepService";
import { StepTime } from "./StepTime";
import { StepUrgent } from "./StepUrgent";
import { Summary } from "./Summary";
import styles from "./Wizard.module.css";

/**
 * Мастер записи. Обычная запись — 4 шага (услуга → филиал и врач → дата и время → контакты),
 * срочная (?mode=urgent) — сразу слоты на сегодня и контакты.
 */
export function BookingWizard({ data }: { data: BookingData }) {
  const { content } = data;
  const router = useRouter();
  const paramsKey = useSearchParams().toString();
  const draft = useBookingStore();
  const { start, update, goTo, submit, step, mode } = draft;

  const [ready, setReady] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const direction = useRef<"forward" | "back">("forward");
  const initialized = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    start(initFromParams(new URLSearchParams(paramsKey), data));
    setReady(true);
  }, [paramsKey, data, start]);

  // После смены шага — фокус на заголовок шага и, если карточка ушла вверх, прокрутка к ней
  useEffect(() => {
    if (!ready) return;
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 96, behavior: "smooth" });
  }, [step, ready]);

  const flow: BookingStep[] = mode === "urgent" ? [3, 4] : [1, 2, 3, 4];
  const position = flow.indexOf(step);
  const previous = flow[position - 1];
  const next = flow[position + 1];
  const go = (target: number) => {
    direction.current = target > step ? "forward" : "back";
    goTo(target as BookingStep);
  };

  const stepLabels: Record<BookingStep, string> = {
    1: content.steps.service,
    2: content.steps.place,
    3: content.steps.time,
    4: content.steps.contacts,
  };
  const progress: ProgressItem[] = flow.map((n) => ({
    id: n,
    label: stepLabels[n],
    state: n < step ? "done" : n === step ? "current" : "todo",
  }));
  if (mode === "urgent") progress.push({ id: 5, label: content.steps.done, state: "todo" });

  const headings: Record<BookingStep, string> = {
    1: content.service.heading,
    2: content.steps.place,
    3: mode === "urgent" ? content.urgent.heading : content.time.heading,
    4: content.contacts.heading,
  };

  const valid = step === 1 ? !!draft.directionId : step === 2 ? !!draft.branchId : step === 3 ? !!draft.slot : true;
  const reason = data.reasons.find((r) => r.id === draft.reasonId);

  const toUrgent = (picked: Reason) => {
    direction.current = "forward";
    start({
      mode: "urgent",
      step: 3,
      reasonId: picked.id,
      directionId: picked.directionId,
      source: { page: "/zapis/", label: content.source.fallback },
    });
  };
  const toPlanned = () => {
    direction.current = "back";
    start({ source: { page: "/zapis/", label: content.source.fallback } });
  };

  const send = async () => {
    const id = await submit(data.consentsVersion);
    if (!id) return;
    setRedirecting(true);
    router.push(`/zapis/gotovo/?id=${encodeURIComponent(id)}`);
  };

  if (!ready || redirecting) {
    return (
      <div className={cx("container", styles.page)}>
        <div className={styles.card} aria-busy="true">
          {redirecting && (
            <p className={styles.redirect} role="status">
              {content.nav.submitting}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("container", styles.page)}>
      <header className={styles.head}>
        <h1 className={styles.title}>{content.title}</h1>
        <p className={styles.lead}>{mode === "urgent" ? content.urgentLead : content.lead}</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.card} ref={cardRef}>
          <Progress label={content.stepsLabel} stepOf={content.stepOf} backTo={content.backTo} items={progress} onSelect={go} />

          <div key={`${mode === "urgent" ? "urgent" : "planned"}-${step}`} className={cx(styles.step, direction.current === "back" ? styles.back : styles.forward)}>
            <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
              {headings[step]}
            </h2>
            {step === 1 && <StepService data={data} draft={draft} update={update} onUrgent={toUrgent} />}
            {step === 2 && <StepPlace data={data} draft={draft} update={update} />}
            {step === 3 && mode !== "urgent" && <StepTime data={data} draft={draft} update={update} />}
            {step === 3 && mode === "urgent" && <StepUrgent data={data} draft={draft} update={update} onPlanned={toPlanned} />}
            {step === 4 && (
              <StepContacts
                content={content}
                draft={draft}
                needHealth={!!reason?.medical}
                errorCode={draft.errorCode}
                update={update}
                onSubmit={send}
                onChooseOtherTime={() => go(3)}
              />
            )}
          </div>

          <div className={styles.footer}>
            {previous ? (
              <Button variant="secondary" onClick={() => go(previous)}>
                {content.nav.back}
              </Button>
            ) : (
              <span />
            )}
            {step === 4 ? (
              <Button type="submit" form={CONTACTS_FORM_ID} disabled={draft.submitting}>
                {draft.submitting ? content.nav.submitting : content.nav.submit}
              </Button>
            ) : (
              <Button disabled={!valid} onClick={() => next && go(next)}>
                {content.nav.next}
              </Button>
            )}
          </div>
        </div>

        <Summary data={data} draft={draft} />
      </div>
    </div>
  );
}
