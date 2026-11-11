"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fill } from "@/lib/format";
import type { BookingData, CabinetContent, CabinetSectionId } from "@/lib/types";
import { usePatientStore } from "@/store/patientStore";
import { useHydrated } from "@/store/useHydrated";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHead } from "@/components/ui/PageHead";
import { AppointmentsSection } from "./AppointmentsSection";
import { DocumentsSection } from "./DocumentsSection";
import { PlanSection } from "./PlanSection";
import { RemindersSection } from "./RemindersSection";
import styles from "./Cabinet.module.css";

type Props = { texts: CabinetContent; data: BookingData };

const ORDER: CabinetSectionId[] = ["appointments", "plan", "documents", "reminders"];

/** /kabinet/: без входа — на /kabinet/vhod/. Слева липкое оглавление, справа 4 раздела. Медкарты нет. */
export function CabinetView({ texts, data }: Props) {
  const router = useRouter();
  const hydrated = useHydrated();
  const profile = usePatientStore((s) => s.profile);
  const signOut = usePatientStore((s) => s.signOut);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/kabinet/vhod/");
  }, [hydrated, profile, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((text: string) => setToast(text), []);

  if (!hydrated || !profile) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.muted} role="status">
            {texts.redirecting}
          </p>
        </div>
      </div>
    );
  }

  const firstName = profile.fullName.split(" ")[1] ?? profile.fullName;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <PageHead title={fill(texts.greeting, { name: firstName })} lead={texts.lead} />
          <div className={styles.headActions}>
            <Button variant="secondary" onClick={signOut}>
              {texts.signOut}
            </Button>
            <ButtonLink href={texts.book.href}>{texts.book.label}</ButtonLink>
          </div>
        </div>

        <div className={styles.layout}>
          <nav className={styles.aside} aria-label={texts.tocLabel}>
            <ul className={styles.toc}>
              {ORDER.map((id) => (
                <li key={id}>
                  <a className={styles.tocLink} href={`#${id}`}>
                    {texts.sections[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.main}>
            <AppointmentsSection texts={texts} data={data} notifyError={notify} />
            <PlanSection texts={texts} data={data} notify={notify} />
            <DocumentsSection texts={texts} />
            <RemindersSection texts={texts} notify={notify} />
          </div>
        </div>
      </div>

      <p className={styles.toast} role="status" aria-live="polite" data-visible={toast ? "" : undefined}>
        {toast}
      </p>
    </div>
  );
}
