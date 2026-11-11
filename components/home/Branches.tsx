import { getBranches, getHomeContent } from "@/lib/api";
import { asset } from "@/lib/asset";
import type { Picture } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { RevealTitle } from "@/components/ui/RevealTitle";
import styles from "./Branches.module.css";

function Photo({ picture, className }: { picture: Picture; className: string }) {
  return (
    <div className={className}>
      <img src={asset(picture.src)} width={picture.width} height={picture.height} alt={picture.alt} loading="lazy" decoding="async" />
    </div>
  );
}

/**
 * Блок 7 главной — «Филиалы» (реф. ref-branches-rows.png, правка 2D):
 * слева заголовок с фото-таблеткой сверху, абзац посередине, 2 доп. фото внизу, между ними — воздух;
 * справа 2 компактные карточки — название, подзаголовок, «Как добраться», 2 фото. Адрес, часы, отзывы — на /filialy/.
 * Названия и часы — branches.json через lib/api.ts, тексты и фото — home.json → branchesBlock.
 */
export async function Branches() {
  const [{ branchesBlock: content }, branches] = await Promise.all([getHomeContent(), getBranches()]);

  const [first] = branches;
  // Часы не рвём по строкам: «Сб–Вс 9:00–18:00» целиком (неразрывный пробел и запрет переноса после тире)
  const keep = (text = "") => text.replaceAll(" ", "\u00a0").replaceAll("–", "–\u2060");
  const intro = content.intro
    .replace("{weekdays}", keep(first?.hours.weekdays))
    .replace("{weekend}", keep(first?.hours.weekend))
    .replace("{kidsBranch}", branches.find((b) => b.hasKidsRoom)?.name ?? "")
    .replace("{ctBranch}", branches.find((b) => b.hasCT)?.name ?? "");

  return (
    <section className={styles.section} aria-labelledby="branches-title">
      <div className={`container ${styles.layout}`}>
        <RevealTitle id="branches-title" text={content.title} pill={content.titlePill} className={styles.title} />

        <p className={styles.intro}>{intro}</p>

        <ul className={styles.cards}>
          {content.cards.map((card) => {
            const branch = branches.find((b) => b.id === card.branchId);
            if (!branch) return null;
            return (
              <li key={branch.id} className={styles.card}>
                <div className={styles.cardText}>
                  <div>
                    <h3 className={styles.cardTitle}>«{branch.name}»</h3>
                    <p className={styles.subtitle}>{card.subtitle}</p>
                  </div>
                  <ButtonLink href={content.routeLink.href} variant="secondary">
                    {content.routeLink.label}
                  </ButtonLink>
                </div>
                <div className={styles.cardPhotos}>
                  {card.photos.map((p) => (
                    <Photo key={p.src} picture={p} className={styles.cardPhoto} />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.extras}>
          {content.extras.map((p) => (
            <Photo key={p.src} picture={p} className={styles.extra} />
          ))}
        </div>
      </div>
    </section>
  );
}
