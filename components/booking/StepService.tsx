import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import type { BookingData, Reason } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import { Button } from "@/components/ui/Button";
import { Option } from "./Option";
import styles from "./Steps.module.css";

type Props = {
  data: BookingData;
  draft: BookingDraft;
  update: (patch: Partial<BookingDraft>) => void;
  /** Срочный повод: переключить мастер на слоты «сегодня». */
  onUrgent: (reason: Reason) => void;
};

/** Шаг 1: услуга (направление → позиция прайса) или «не знаю, к кому» → повод из списка. */
export function StepService({ data, draft, update, onUrgent }: Props) {
  const t = data.content.service;
  const doctor = data.doctors.find((d) => d.id === draft.doctorId);
  // Если врач выбран заранее (из его карточки), показываем только его направления
  const directions = doctor ? data.directions.filter((d) => doctor.directions.includes(d.id)) : data.directions;
  const unknown = draft.mode === "unknown";
  const reason = data.reasons.find((r) => r.id === draft.reasonId);
  const items = data.items.filter((i) => i.directionId === draft.directionId);

  const switchTab = (mode: "planned" | "unknown") =>
    update({ mode, directionId: null, serviceId: null, reasonId: null, slot: null });

  return (
    <div>
      {!doctor && (
        <div className={styles.tabs} role="group" aria-label={t.heading}>
          <button type="button" className={cx(styles.tab, !unknown && styles.tabActive)} aria-pressed={!unknown} onClick={() => switchTab("planned")}>
            {t.tabs.known}
          </button>
          <button type="button" className={cx(styles.tab, unknown && styles.tabActive)} aria-pressed={unknown} onClick={() => switchTab("unknown")}>
            {t.tabs.unknown}
          </button>
        </div>
      )}

      {unknown ? (
        <div>
          <p className={styles.hint}>{t.reasonsHint}</p>
          <div className={styles.twoCols} role="group" aria-label={t.reasonsLabel}>
            {data.reasons.map((r) => (
              <Option
                key={r.id}
                title={r.title}
                selected={r.id === draft.reasonId}
                onClick={() => update({ reasonId: r.id, directionId: r.directionId, serviceId: null, branchId: null, doctorId: null, slot: null })}
              />
            ))}
          </div>
          {reason?.urgent && !reason.kids && (
            <div className={styles.callout}>
              <p>{t.urgentHint.text}</p>
              <Button variant="secondary" onClick={() => onUrgent(reason)}>
                {t.urgentHint.action}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.split}>
          <div>
            <h3 className={styles.subheading}>{t.directionsLabel}</h3>
            <div className={styles.list} role="group" aria-label={t.directionsLabel}>
              {directions.map((d) => (
                <Option
                  key={d.id}
                  title={d.title}
                  meta={formatPrice(d.priceFrom, true)}
                  selected={d.id === draft.directionId}
                  onClick={() => update({ directionId: d.id, serviceId: null, reasonId: null, slot: null })}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className={styles.subheading}>{t.itemsHeading}</h3>
            {draft.directionId ? (
              <div className={styles.list} role="group" aria-label={t.itemsHeading}>
                <Option title={t.anyItem} selected={!draft.serviceId} onClick={() => update({ serviceId: null, slot: null })} />
                {items.map((i) => (
                  <Option
                    key={i.id}
                    title={i.title}
                    meta={formatPrice(i.price, i.priceIsFrom)}
                    selected={i.id === draft.serviceId}
                    onClick={() => update({ serviceId: i.id, slot: null })}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.placeholder}>{t.directionsLabel}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
