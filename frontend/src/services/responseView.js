import { getIngredientSummary } from './ingredients.js';

export function getResponseView(tab, results, customResult) {
  const response = tab === 'custom' ? customResult : results?.json.llm_post_process;
  const summary = getIngredientSummary(response?.structured);
  const content =
    tab === 'ingredients'
      ? summary.ingredients.length
        ? summary.ingredients.join('\n')
        : summary.text
      : response
        ? JSON.stringify(response, null, 2)
        : '';
  return {
    response,
    summary,
    content,
    hasContent: Boolean(response),
    canExport: Boolean(response && content && (tab !== 'ingredients' || !response.error)),
    filename: tab === 'ingredients' ? 'ingredients.txt' : `${tab}-response.json`,
    mime: tab === 'ingredients' ? 'text/plain' : 'application/json',
  };
}
