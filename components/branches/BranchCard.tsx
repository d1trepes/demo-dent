import { asset } from "@/lib/asset";
import { fill } from "@/lib/format";
import type { Branch, BranchesPageContent } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./BranchCard.module.css";

type Props = { branch: Branch; texts: BranchesPageContent };

/** Филиал на /filialy/: слева 2 фото и карта-заглушка, справа адрес, часы, что есть, как добраться, кнопки. */
export function BranchCard({ branch, texts }: Props) {
  const { labels, map } = texts;
  const titleId = `branch-${branch.id}`;
  const pills = [
    fill(labels.chairs, { n: branch.chairs }),
    ...(branch.hasCT ? [labels.ct] : []),
    ...(branch.hasKidsRoom ? [labels.kidsRoom] : []),
    ...branch.features,
  ];
  const mapUrl = fill(map.url, { lat: branch.coords.lat, lng: branch.coords.lng });

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.media}>
        <div className={styles.photos}>
          {texts.photos[branch.id].map((p) => (
            <img key={p.src} src={asset(p.src)} width={p.width} height={p.height} alt={p.alt} loading="lazy" decoding="async" />
          ))}
        </div>
        <div className={styles.map}>
          <p className={styles.mapAddress}>{branch.address}</p>
          <a className={styles.mapLink} href={mapUrl} target="_blank" rel="noopener">
            {map.label}
            <span className="visually-hidden"> — {map.note}</span>
          </a>
        </div>
      </div>

      <div className={styles.body}>
        <header>
          <h2 id={titleId} className={styles.name}>
            {branch.name}
          </h2>
          <p className={styles.district}>{branch.district}</p>
        </header>

        <dl className={styles.facts}>
          <div>
            <dt>{labels.address}</dt>
            <dd>{branch.address}</dd>
          </div>
          <div>
            <dt>{labels.hours}</dt>
            <dd>
              {branch.hours.weekdays}
              <br />
              {branch.hours.weekend}
            </dd>
          </div>
          <div>
            <dt>{labels.phone}</dt>
            <dd>
              <a className={styles.phone} href={`tel:${branch.phone.replace(/[^\d+]/g, "")}`}>
                {branch.phone}
              </a>
            </dd>
          </div>
        </dl>

        <ul className={styles.pills}>
          {pills.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <div className={styles.route}>
          <div>
            <h3 className={styles.subtitle}>{labels.howToGet}</h3>
            <ul className={styles.list}>
              {branch.howToGet.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={styles.subtitle}>{labels.parking}</h3>
            <p className={styles.text}>{branch.parking}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <ButtonLink href={`/zapis/?branch=${branch.id}`}>{texts.book}</ButtonLink>
          <ButtonLink href={`/vrachi/?branch=${branch.id}`} variant="secondary">
            {texts.doctors}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
