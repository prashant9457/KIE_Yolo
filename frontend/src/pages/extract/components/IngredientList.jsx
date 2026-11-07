import { Leaf } from 'lucide-react';

export default function IngredientList({ summary, error }) {
  if (error)
    return (
      <p className="provider-error" role="alert">
        {error}
      </p>
    );
  return (
    <div className="ingredient-summary">
      <div className="ingredient-heading">
        <Leaf size={16} />
        <span>
          {summary.ingredients.length
            ? `${summary.ingredients.length} ingredients identified`
            : 'Ingredients on the label'}
        </span>
      </div>
      {summary.ingredients.length ? (
        <ol className="ingredient-list">
          {summary.ingredients.map((ingredient, index) => (
            <li key={`${index}-${ingredient}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {ingredient}
            </li>
          ))}
        </ol>
      ) : (
        <p className="ingredient-statement">
          {summary.text ||
            'No ingredient list was identified. Try a clearer photo of the ingredients section.'}
        </p>
      )}
      {summary.ingredients.length > 0 && summary.text && (
        <details className="ingredient-statement-detail">
          <summary>Full ingredient statement</summary>
          <p>{summary.text}</p>
        </details>
      )}
      <p className="ingredient-disclaimer">
        Check the package label for accuracy, especially for allergens.
      </p>
    </div>
  );
}
