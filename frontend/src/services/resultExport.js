import { getResponseView } from './responseView.js';
import { getTranslatedIngredients } from './translations.js';

function escapeCsv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export function formatResult(view, format) {
  if (format === 'json') return JSON.stringify(view.response ?? view.content, null, 2);
  if (format === 'csv') {
    if (Array.isArray(view.response?.structured?.ingredients)) {
      const ingredients = view.response.structured.ingredients;
      const rows = ingredients.map((item) => {
        if (typeof item === 'string') return [item];
        return [
          item.name ?? item.ingredient ?? '',
          ...(item.translations ? Object.values(item.translations) : []),
        ];
      });
      const columns = Math.max(1, ...rows.map((row) => row.length));
      return [
        Array.from({ length: columns }, (_, index) =>
          escapeCsv(index === 0 ? 'Ingredient' : `Translation ${index}`),
        ).join(','),
        ...rows.map((row) => row.map(escapeCsv).join(',')),
      ].join('\n');
    }
    return String(view.content ?? '')
      .split(/\r?\n/)
      .map(escapeCsv)
      .join('\n');
  }
  return view.content;
}

export function getResultExport(tab, results, customResult, language = 'original', messages = []) {
  const view = getResponseView(tab, results, customResult);
  if (tab === 'ingredients' && language !== 'original') {
    const ingredients = getTranslatedIngredients(
      results?.json.llm_post_process?.structured,
      language,
    );
    return {
      ...view,
      content: ingredients?.join('\n') || '',
      filename: `ingredients-${language}.txt`,
      canExport: Boolean(ingredients?.length && !view.response?.error),
    };
  }
  if (tab === 'custom') {
    const content = messages
      .map((message) => `${message.role === 'user' ? 'You' : 'Assistant'}: ${message.text}`)
      .join('\n\n');
    return {
      ...view,
      content,
      canExport: messages.some((message) => message.role === 'assistant' && !message.error),
      filename: 'ingredient-conversation.txt',
      mime: 'text/plain',
    };
  }
  return view;
}
