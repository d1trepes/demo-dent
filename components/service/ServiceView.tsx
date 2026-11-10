import { CallbackCard } from "@/components/home/CallbackCard";
import { Manifesto } from "@/components/home/Manifesto";
import { PlanBranch } from "@/components/home/PlanBranch";
import type { HomeCallback, ServiceDetails, ServicePageTexts } from "@/lib/types";
import { ServiceAside } from "./ServiceAside";
import { ServiceDoctors } from "./ServiceDoctors";
import { ServiceIntro } from "./ServiceIntro";
import { ServicePrices } from "./ServicePrices";
import styles from "./ServiceView.module.css";

type Props = { service: ServiceDetails; texts: ServicePageTexts; callback: HomeCallback };

/**
 * Страница услуги: шапка → плашка + «Кому подходит» и «Цены» → этапы (манифест + ветка) → врачи → «Перезвоните мне».
 * Предупреждение о противопоказаниях — только в подвале, FAQ и итогового призыва нет (docs/DESIGN.md).
 */
export function ServiceView({ service, texts, callback }: Props) {
  const { page } = service;
  const source = { page: `/uslugi/${page.slug}/`, label: page.callback.sourceLabel };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>{page.title}</h1>
        <p className={styles.lead}>{page.lead}</p>

        <div className={styles.layout}>
          <ServiceAside service={service} texts={texts} />
          <div className={styles.content}>
            <ServiceIntro service={service} texts={texts} />
            <ServicePrices service={service} texts={texts} />
          </div>
        </div>

        <section id="steps" className={styles.steps} aria-label={texts.stepsLabel}>
          <Manifesto content={page.manifesto} id="steps-manifesto" />
          <PlanBranch content={{ steps: page.steps }} compact />
        </section>

        <ServiceDoctors service={service} texts={texts} />

        <section className={styles.callback} aria-labelledby="callback-title">
          <CallbackCard
            content={{ ...callback, title: page.callback.title, subtitle: page.callback.subtitle }}
            titleId="callback-title"
            source={source}
          />
        </section>
      </div>
    </div>
  );
}
