import { TRANSLATION_CODES } from '../config/languages.js';

export function getTranslatedIngredients(structured, language) {
  const names =
    language === 'original' ? structured?.ingredients : structured?.translations?.[language];
  const count = structured?.ingredients?.length;
  return Array.isArray(names) &&
    names.length === count &&
    names.every((name) => typeof name === 'string' && name.trim())
    ? names
    : null;
}

export function hasCompleteTranslations(structured) {
  return (
    Array.isArray(structured?.ingredients) &&
    TRANSLATION_CODES.every((code) => getTranslatedIngredients(structured, code) !== null)
  );
}
