import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { fill, formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import type { CabinetContent, PatientDocument } from "@/lib/types";
import docStyles from "@/components/about/DocumentsView.module.css";
import styles from "./Cabinet.module.css";

/** Раздел «Документы»: PDF-заглушки строками как на /o-klinike/dokumenty/ + заказ справки для вычета. */
export function DocumentsSection({ texts }: { texts: CabinetContent }) {
  const [docs, setDocs] = useState<PatientDocument[] | null>(null);
  const t = texts.documents;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getDocuments } = await import("@/lib/api");
      const list = await getDocuments();
      if (!cancelled) setDocs(list.sort((a, b) => b.date.localeCompare(a.date)));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="documents" className={styles.section} aria-labelledby="documents-title" aria-busy={!docs}>
      <h2 id="documents-title" className={styles.sectionTitle}>
        {texts.sections.documents}
      </h2>
      <ul className={docStyles.list}>
        {docs?.map((d) => (
          <li key={d.id}>
            <a className={docStyles.row} href={asset(d.file)} download>
              <span className={docStyles.name}>{d.title}</span>
              <span className={docStyles.meta}>{fill(t.fileLabel, { date: formatDate(d.date) })}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.taxCta}>
        <div>
          <p className={styles.stageTitle}>{t.tax.title}</p>
          <p className={styles.muted}>{t.tax.text}</p>
        </div>
        <ButtonLink href={t.tax.href} variant="secondary">
          {t.tax.label}
        </ButtonLink>
      </div>
    </section>
  );
}
