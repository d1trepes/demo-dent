import type { Direction, PriceItem, ServicesIndexCard, ServicesIndexCardView } from "./types";

/**
 * Цена и признак «от» — из services.json, в тексте страницы их нет.
 * Признак берём у позиции прайса с той же ценой, что у направления (у профгигиены цена фиксированная).
 */
export function resolveServiceCards(
  cards: ServicesIndexCard[],
  directions: Direction[],
  items: PriceItem[],
): ServicesIndexCardView[] {
  return cards.map((card) => {
    const direction = directions.find((d) => d.id === card.directionId);
    if (!direction) throw new Error(`/uslugi/: направление ${card.directionId} не найдено в services.json`);
    const item = items.find((i) => i.directionId === direction.id && i.price === direction.priceFrom);
    return { ...card, price: direction.priceFrom, priceIsFrom: item?.priceIsFrom ?? true };
  });
}
