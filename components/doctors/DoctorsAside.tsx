import aside from "@/components/services/ServicesAside.module.css";
import type { BranchId, DoctorsPageContent, Specialty, SpecialtyInfo } from "@/lib/types";
import styles from "./DoctorsAside.module.css";

export type DoctorsFilter = { specialty: Specialty | null; branch: BranchId | null; kids: boolean };

type Props = {
  texts: DoctorsPageContent["list"];
  specialties: SpecialtyInfo[];
  branches: { id: BranchId; name: string }[];
  filter: DoctorsFilter;
  /** Счётчики по специальностям с учётом филиала и «детей»; all — все специальности. */
  counts: Record<string, number>;
  onChange: (patch: Partial<DoctorsFilter>) => void;
};

/** Липкая белая плашка как у /uslugi/: филиал, «Принимает детей», специальности со счётчиком. */
export function DoctorsAside({ texts, specialties, branches, filter, counts, onChange }: Props) {
  const branchOptions = [{ id: null, name: texts.allBranches }, ...branches];
  const specialtyOptions = [
    { id: null, label: texts.allSpecialties, count: counts.all },
    ...specialties.map((s) => ({ id: s.id, label: s.plural, count: counts[s.id] })),
  ];

  return (
    <aside className={aside.aside}>
      <div className={styles.top}>
        <p className={styles.label} id="doctors-branch">
          {texts.branchLabel}
        </p>
        <div className={styles.segments} role="group" aria-labelledby="doctors-branch">
          {branchOptions.map((b) => (
            <button
              key={b.id ?? "all"}
              type="button"
              className={styles.segment}
              aria-pressed={filter.branch === b.id}
              onClick={() => onChange({ branch: b.id })}
            >
              {b.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={filter.kids}
          onClick={() => onChange({ kids: !filter.kids })}
        >
          {texts.kids}
        </button>
      </div>

      <p className={styles.label} id="doctors-specialty">
        {texts.specialtyLabel}
      </p>
      <div className={aside.cats} role="group" aria-labelledby="doctors-specialty">
        {specialtyOptions.map((s) => (
          <button
            key={s.id ?? "all"}
            type="button"
            className={aside.cat}
            aria-pressed={filter.specialty === s.id}
            disabled={s.count === 0 && filter.specialty !== s.id}
            onClick={() => onChange({ specialty: s.id })}
          >
            <span>{s.label}</span>
            <span className={aside.count}>{s.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
