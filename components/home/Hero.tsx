import { getHomeContent } from "@/lib/api";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { HeroLeaf } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./Hero.module.css";

/**
 * Блок 1 главной — «Ветвь ясеня» (docs/DESIGN.md, холст «Ясень — идеи первого экрана», артборд 2).
 * Синяя плашка с «Лечим всей / СЕМЬЁЙ», врач в овале, от овала вниз — стебель с тремя парами листьев.
 * Все размеры сцены — в единицах макета (--u), сцена масштабируется по ширине контейнера.
 */
export async function Hero() {
  const { hero } = await getHomeContent();

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <div className={styles.stage}>
          <div className={styles.plate} aria-hidden />

          <Aside lines={hero.asideLeft} className={styles.asideLeft} />
          <Aside lines={hero.asideRight} className={styles.asideRight} />

          <h1 id="hero-title" className={styles.title}>
            <span className={styles.titleLead}>{hero.title.lead}</span>{" "}
            <span className={styles.titleAccent}>{hero.title.accent}</span>
          </h1>

          <Branch />

          {hero.leaves.map((leaf) => (
            <Leaf key={`${leaf.tier}-${leaf.side}`} leaf={leaf} />
          ))}

          <div className={styles.oval}>
            <img
              src={asset(hero.photo.src)}
              width={hero.photo.width}
              height={hero.photo.height}
              alt={hero.photo.alt}
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <ButtonLink href={hero.doctorsLink.href} variant="secondary" className={styles.doctors}>
            {hero.doctorsLink.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Aside({ lines, className }: { lines: string[]; className: string }) {
  return (
    <p className={cx(styles.aside, className)}>
      {lines.map((line, i) => (
        <span key={line}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  );
}

/**
 * Лист-«линза», фото непрозрачное, обводка 2 px поверх.
 * У средней пары обводка меняет цвет ровно по нижнему краю плашки: снизу кобальт, сверху белая, обрезанная clip-path.
 */
function Leaf({ leaf }: { leaf: HeroLeaf }) {
  return (
    <div className={cx(styles.leaf, styles[leaf.tier], styles[leaf.side])}>
      <div className={styles.leafPhoto}>
        <img src={asset(leaf.src)} width={640} height={640} alt={leaf.alt} loading="lazy" decoding="async" />
      </div>
      {leaf.tier !== "top" && <span className={cx(styles.leafOutline, styles.outlineBlue)} aria-hidden />}
      {leaf.tier !== "bottom" && <span className={cx(styles.leafOutline, styles.outlineWhite)} aria-hidden />}
    </div>
  );
}

/** Стебель и черенки. Две версии: десктоп (3 пары) и мобильный (только нижняя пара). */
function Branch() {
  return (
    <>
      <svg className={cx(styles.branch, styles.branchDesktop)} viewBox="0 0 1360 772" preserveAspectRatio="none" aria-hidden>
        <path className={styles.stroke} d="M680 600 V716" />
        {/* Черенок приходит в основание листа по его диагонали: кривая выходит на ось листа,
            последний отрезок — прямой под 45° и заходит на 4 ед. внутрь (лист выше, зазора нет). */}
        <path className={styles.strokeWhite} d="M680 516 C620 518 532 518 516 502 L496 482 M680 516 C740 518 828 518 844 502 L864 482" />
        <path className={styles.strokeSoft} d="M680 646 C580 652 436 682 414 660 L386 632 M680 646 C780 652 924 682 946 660 L974 632" />
        <path className={styles.stroke} d="M680 744 C540 752 312 798 296 782 L276 762 M680 744 C820 752 1048 798 1064 782 L1084 762" />
      </svg>
      <svg className={cx(styles.branch, styles.branchMobile)} viewBox="0 0 335 566" preserveAspectRatio="none" aria-hidden>
        <path className={styles.stroke} d="M167.5 340 V510" />
        <path className={styles.stroke} d="M167.5 400 C162 444 154 476 140 490 M167.5 400 C173 444 181 476 195 490" />
      </svg>
    </>
  );
}
