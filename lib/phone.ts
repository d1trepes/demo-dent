/**
 * Маска российского номера «+7 (___) ___-__-__». Без библиотек: форма обратного звонка (2E),
 * мастер записи и вход в кабинет используют одну функцию.
 */

/** Цифры номера без кода страны (не больше 10): «+7 (912…», «8 912…», «79121234567», «912…» → «912…». */
function localDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  const hasCountryCode = value.trim().startsWith("+7") || (/^[78]/.test(digits) && (digits.length === 1 || digits.length === 11));
  return (hasCountryCode ? digits.slice(1) : digits).slice(0, 10);
}

/** Пошаговое форматирование при вводе: «9121» → «+7 (912) 1». Пустая строка остаётся пустой. */
export function formatPhone(value: string): string {
  const d = localDigits(value);
  if (!d) return "";
  // Скобку закрываем только с 4-й цифрой — иначе Backspace не сотрёт её
  let out = `+7 (${d.slice(0, 3)}`;
  if (d.length > 3) out += `) ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

/** Номер введён полностью: 11 цифр вместе с семёркой. */
export function isCompletePhone(value: string): boolean {
  return value.replace(/\D/g, "").length === 11;
}

export const PHONE_PLACEHOLDER = "+7 (___) ___-__-__";
