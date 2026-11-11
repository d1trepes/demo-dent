import { PageHead } from "@/components/ui/PageHead";
import { fill, formatDate } from "@/lib/format";
import type { AboutContent, LegalDoc } from "@/lib/types";
import styles from "./LegalDocView.module.css";

type Props = { doc: LegalDoc; texts: AboutContent["legalPage"] };

/** Шаблон юр.текстов (/privacy/, /soglasie/, /soglasie-zdorovye/): липкое оглавление слева, текст в белой карточке. */
export function LegalDocView({ doc, texts }: Props) {
  const anchor = (i: number) => `${doc.id}-${i + 1}`;
  return (
    <div className={styles.page}>
      <div className="container">
        <PageHead title={doc.title} />
        <p className={styles.edition}>{fill(texts.edition, { version: doc.version, date: formatDate(doc.updatedAt) })}</p>

        <div className={styles.layout}>
          <nav className={styles.aside} aria-label={texts.tocLabel}>
            <ol className={styles.toc}>
              {doc.sections.map((s, i) => (
                <li key={s.heading}>
                  <a className={styles.tocLink} href={`#${anchor(i)}`}>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className={styles.card}>
            {doc.sections.map((s, i) => (
              <section key={s.heading} id={anchor(i)} className={styles.section}>
                <h2 className={styles.heading}>{s.heading}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p} className={styles.paragraph}>
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}
