import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";
import { asset } from "@/lib/asset";
import type { AboutContent, ClinicDocument, LegalDoc } from "@/lib/types";
import styles from "./DocumentsView.module.css";

type Props = { texts: AboutContent["documents"]; files: ClinicDocument[]; legalDocs: LegalDoc[] };

/** /o-klinike/dokumenty/: PDF клиники строками-карточками + ссылки на 3 текстовые юр.страницы. */
export function DocumentsView({ texts, files, legalDocs }: Props) {
  const pages = texts.legalPages.flatMap((p) => {
    const doc = legalDocs.find((d) => d.id === p.id);
    return doc ? [{ href: p.href, title: doc.title }] : [];
  });
  return (
    <div className={styles.page}>
      <div className="container">
        <PageHead title={texts.title} lead={texts.lead} />

        <section className={styles.group} aria-labelledby="docs-files">
          <h2 id="docs-files" className={styles.groupTitle}>
            {texts.filesTitle}
          </h2>
          <ul className={styles.list}>
            {files.map((f) => (
              <li key={f.id}>
                <a className={styles.row} href={asset(f.file)} download>
                  <span className={styles.name}>{f.title}</span>
                  <span className={styles.meta}>{texts.fileLabel}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.group} aria-labelledby="docs-texts">
          <h2 id="docs-texts" className={styles.groupTitle}>
            {texts.textsTitle}
          </h2>
          <ul className={styles.list}>
            {pages.map((p) => (
              <li key={p.href}>
                <Link className={styles.row} href={p.href}>
                  <span className={styles.name}>{p.title}</span>
                  <span className={styles.meta}>{texts.pageLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
