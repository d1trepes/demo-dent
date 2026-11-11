import styles from "./PageHead.module.css";

type Props = { title: string; lead?: string };

/** Верх внутренней страницы: h1 Prata + lead, как у /uslugi/ и /akcii/. */
export function PageHead({ title, lead }: Props) {
  return (
    <header>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}
