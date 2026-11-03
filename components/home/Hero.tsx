import { getHomeContent } from "@/lib/api";
import { asset } from "@/lib/asset";
import { cx } from "@/lib/cx";
import type { HeroLeaf } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { Contraindications } from "@/components/ui/Contraindications";
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

        <Contraindications className={styles.note} />
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
 * Лист-«линза». Фото гаснет к плашке (opacity), обводка 2 px — нет.
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
        <path className={styles.strokeWhite} d="M680 516 C610 516 550 506 500 486 M680 516 C750 516 810 506 860 486" />
        <path className={styles.strokeSoft} d="M680 646 C560 651 460 644 390 636 M680 646 C800 651 900 644 970 636" />
        <path className={styles.stroke} d="M680 744 C520 758 380 764 280 766 M680 744 C840 758 980 764 1080 766" />
      </svg>
      <svg className={cx(styles.branch, styles.branchMobile)} viewBox="0 0 335 566" preserveAspectRatio="none" aria-hidden>
        <path className={styles.stroke} d="M167.5 340 V510" />
        <path className={styles.stroke} d="M167.5 400 C162 444 154 476 140 490 M167.5 400 C173 444 181 476 195 490" />
      </svg>
    </>
  );
}
