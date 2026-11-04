import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import type { BookingData, Reason } from "@/lib/types";
import type { BookingDraft } from "@/store/bookingStore";
import { UrgentCallout } from "@/components/ui/UrgentCallout";
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

      {/* Обе вкладки лежат в одной ячейке грида: высота — по большей, при переключении ничего не прыгает */}
      <div className={styles.panels}>
        <div className={cx(styles.panel, !unknown && styles.panelHidden)} inert={!unknown}>
          <p className={styles.hint}>{t.reasonsHint}</p>
          <div className={styles.grid} role="group" aria-label={t.reasonsLabel}>
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
            <UrgentCallout
              compact
              className={styles.reveal}
              title={t.urgentHint.title}
              text={t.urgentHint.text}
              action={t.urgentHint.action}
              onAction={() => onUrgent(reason)}
            />
          )}
        </div>

        <div className={cx(styles.panel, unknown && styles.panelHidden)} inert={unknown}>
          <div className={styles.grid} role="group" aria-label={t.directionsLabel}>
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
          {!unknown && draft.directionId && items.length > 0 && (
            <div key={draft.directionId} className={styles.reveal}>
              <h3 className={styles.subheading}>{t.itemsHeading}</h3>
              <div className={styles.grid} role="group" aria-label={t.itemsHeading}>
                <Option compact title={t.anyItem} selected={!draft.serviceId} onClick={() => update({ serviceId: null, slot: null })} />
                {items.map((i) => (
                  <Option
                    key={i.id}
                    compact
                    title={i.title}
                    meta={formatPrice(i.price, i.priceIsFrom)}
                    selected={i.id === draft.serviceId}
                    onClick={() => update({ serviceId: i.id, slot: null })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
