import type { ReactNode } from "react";
import styles from "./PageStub.module.css";

type Props = {
  title: string;
  /** Номер чата, в котором страница будет сделана. */
  chat: number;
  children?: ReactNode;
};

/** Заглушка страницы каркаса: заголовок, «в разработке» и, при необходимости, проверочные данные. */
export function PageStub({ title, chat, children }: Props) {
  return (
    <div className={`container ${styles.stub}`}>
      <h1>{title}</h1>
      <p className={styles.note}>Страница в разработке — чат {chat}.</p>
      {children}
    </div>
  );
}
