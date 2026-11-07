// Normalize provider output without guessing ingredient names from raw OCR.
export function getIngredientSummary(structured) {
  if (!structured || typeof structured !== 'object') return { ingredients: [], text: '' };
  const entries = Array.isArray(structured.ingredients) ? structured.ingredients : [];
  const ingredients = entries
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.ingredient || ''))
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());
  const candidate =
    structured.postprocessed_corrected_text ??
    structured.text ??
    (typeof structured.ingredients === 'string' ? structured.ingredients : '');
  return { ingredients, text: typeof candidate === 'string' ? candidate : '' };
}
