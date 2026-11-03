"use client";

import Link from "next/link";
import { useState } from "react";
import { asset } from "@/lib/asset";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./DoctorsShowcase.module.css";

export type DoctorCard = {
  slug: string;
  fullName: string;
  position: string;
  /** Стаж, категория, филиалы — уже готовыми строками. */
  facts: string[];
  about: string;
  photo: string;
};

type Props = {
  doctors: DoctorCard[];
  photo: { width: number; height: number };
  labels: { book: string; profile: string; thumbs: string };
};

/** «Ковалёва Мария Андреевна» → фамилия отдельной строкой. */
function splitName(fullName: string): [string, string] {
  const space = fullName.indexOf(" ");
  return space === -1 ? [fullName, ""] : [fullName.slice(0, space), fullName.slice(space + 1)];
}

/** Большая карточка + миниатюры-листья. Клик по миниатюре меняет врачей местами. */
export function DoctorsShowcase({ doctors, photo, labels }: Props) {
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
      <div key={active.slug} className={styles.photo}>
        <img
          src={asset(active.photo)}
          width={photo.width}
          height={photo.height}
          alt={`${active.fullName}, ${active.position.toLowerCase()}`}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className={styles.info}>
        <div key={active.slug} className={styles.details} aria-live="polite">
          <p className={styles.position}>{active.position}</p>
          <h3 className={styles.name}>
            {surname}
            {name && <span className={styles.nameRest}>{name}</span>}
          </h3>
          <ul className={styles.facts}>
            {active.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <p className={styles.about}>{active.about}</p>
          <div className={styles.actions}>
            <ButtonLink href={`/zapis/?doctor=${active.slug}`}>{labels.book}</ButtonLink>
            <Link href={`/vrachi/${active.slug}/`} className={styles.profile}>
              {labels.profile}
            </Link>
          </div>
        </div>

        <ul className={styles.thumbs} aria-label={labels.thumbs}>
          {order.slice(1).map((slug, i) => {
            const doctor = bySlug.get(slug);
            if (!doctor) return null;
            const [thumbSurname, thumbName] = splitName(doctor.fullName);
            return (
              <li key={slug}>
                <button
                  type="button"
                  className={styles.thumb}
                  onClick={() => swap(i + 1)}
                  aria-label={`Показать: ${doctor.fullName}, ${doctor.position.toLowerCase()}`}
                >
                  <span className={styles.leaf}>
                    <img
                      src={asset(doctor.photo)}
                      width={photo.width}
                      height={photo.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className={styles.thumbName} aria-hidden>
                    {thumbSurname}
                    <span>{thumbName.split(" ")[0]}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
