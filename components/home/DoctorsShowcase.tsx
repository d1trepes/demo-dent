"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./DoctorsShowcase.module.css";

export type DoctorCard = {
  slug: string;
  fullName: string;
  position: string;
  /** Стаж и филиал — уже готовыми строками. */
  facts: string[];
  about: string;
  photo: string;
};

type Props = {
  doctors: DoctorCard[];
  photo: { width: number; height: number };
  labels: { book: string; profile: string; thumbs: string };
  allDoctors: { href: string; label: string };
};

/** «Ковалёва Мария Андреевна» → фамилия отдельной строкой. */
function splitName(fullName: string): [string, string] {
  const space = fullName.indexOf(" ");
  return space === -1 ? [fullName, ""] : [fullName.slice(0, space), fullName.slice(space + 1)];
}

/**
 * Ряд врачей по референсу ref-doctors-carousel.png: маленькое фото слева → большое → текст,
 * под текстом ряд маленьких. order[0] — большой врач, order[1] — маленький слева, остальные — справа.
 * Клик по маленькому — врачи меняются местами.
 */
export function DoctorsShowcase({ doctors, photo, labels, allDoctors }: Props) {
  const [order, setOrder] = useState(() => doctors.map((d) => d.slug));
  const bySlug = new Map(doctors.map((d) => [d.slug, d]));
  const active = bySlug.get(order[0]);
  if (!active) return null;
  const [surname, name] = splitName(active.fullName);

  const swap = (index: number) =>
    setOrder((prev) => {
      const next = [...prev];
      [next[0], next[index]] = [next[index], next[0]];
      return next;
    });

  return (
    <div className={styles.root}>
      <div key={active.slug} className={`${styles.photo} ${styles.fade}`}>
        <img
          src={asset(active.photo)}
          width={photo.width}
          height={photo.height}
          alt={`${active.fullName}, ${active.position.toLowerCase()}`}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div key={`${active.slug}-text`} className={`${styles.details} ${styles.fade}`} aria-live="polite">
        <p className={styles.position}>{active.position}</p>
        <h3 className={styles.name}>
          {surname}
          {name && <span className={styles.nameRest}>{name}</span>}
        </h3>
        <p className={styles.facts}>{active.facts.join(" · ")}</p>
        <p className={styles.about}>{active.about}</p>
        <div className={styles.actions}>
          <ButtonLink href={`/zapis/?doctor=${active.slug}`}>{labels.book}</ButtonLink>
          <ButtonLink href={`/vrachi/${active.slug}/`} variant="secondary" className={styles.desktopOnly}>
            {labels.profile}
          </ButtonLink>
          <ButtonLink href={allDoctors.href} variant="secondary" className={styles.mobileOnly}>
            {allDoctors.label}
          </ButtonLink>
        </div>
      </div>

      <ul className={styles.thumbs} aria-label={labels.thumbs}>
        {order.slice(1).map((slug, i) => {
          const doctor = bySlug.get(slug);
          if (!doctor) return null;
          return (
            <li key={slug} className={i === 0 ? styles.thumbLeft : undefined}>
              <button
                type="button"
                className={`${styles.thumb} ${styles.fade}`}
                onClick={() => swap(i + 1)}
                aria-label={`Показать: ${doctor.fullName}, ${doctor.position.toLowerCase()}`}
              >
                <img src={asset(doctor.photo)} width={photo.width} height={photo.height} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
