import { useMemo } from 'react';
import AnimatedList from '../../../components/reactbits/AnimatedList';
import GlideSelect from '../../../components/reactbits/GlideSelect';
import Button from '../../../components/ui/Button';
import Notice from '../../../components/ui/Notice';
import { LANGUAGES } from '../../../config/languages';
import { getTranslatedIngredients } from '../../../services/translations';
import { colors, listTheme, radii } from '../../../styles/theme';
import './IngredientList.css';

export default function IngredientList({
  summary,
  error,
  structured,
  onTranslate,
  isTranslating = false,
  language = 'original',
  onLanguageChange,
  compact = false,
}) {
  const translated = getTranslatedIngredients(structured, language);
  const missing = language !== 'original' && translated === null;
  const names = language === 'original' ? summary.ingredients : translated;
  const items = useMemo(
    () =>
      (names || []).map((name, index) => ({
        title: name,
        original: language === 'original' ? '' : summary.ingredients[index],
        index,
      })),
    [names, summary.ingredients, language],
  );
  const selectLanguage = (value) => {
    onLanguageChange?.(value);
    if (value !== 'original' && !getTranslatedIngredients(structured, value) && !isTranslating)
      onTranslate?.();
  };

  if (error)
    return (
      <div className="ingredient-error">
        <Notice>{error}</Notice>
        {onTranslate && (
          <Button onClick={onTranslate} disabled={isTranslating}>
            {isTranslating ? 'Analyzing...' : 'Retry analysis'}
          </Button>
        )}
      </div>
    );
  return (
    <div className={`ingredient-summary ${compact ? 'ingredient-summary--compact' : ''}`}>
      <div className="ingredient-controls">
        <span className="ingredient-total">
          {summary.ingredients.length} <span>ingredients</span>
        </span>
        <GlideSelect
          className="rb-select"
          options={LANGUAGES}
          value={language}
          onChange={selectLanguage}
          ariaLabel="Ingredient language"
          accentColor={colors.accent}
          surfaceColor={colors.surface}
          highlightColor={colors.accentSoft}
          textColor={colors.text}
          radius={radii.inner}
          menuWidth={230}
          align="right"
          size="lg"
          showTags={false}
        />
      </div>
      {missing ? (
        <div className="translation-status" role="status">
          <p>
            {isTranslating
              ? 'Translating your ingredients into six languages...'
              : 'Translations are not available for this result yet.'}
          </p>
          {!isTranslating && onTranslate && (
            <Button size="sm" onClick={onTranslate}>
              Generate translations
            </Button>
          )}
        </div>
      ) : names?.length ? (
        <div
          className="ingredient-list"
          lang={language === 'original' ? undefined : language}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <AnimatedList
            key={language}
            theme="light"
            width="100%"
            maxHeight={compact ? 280 : '100%'}
            frame={false}
            showGradients={false}
            animation="fade"
            stagger={0.025}
            items={items}
            style={listTheme}
            radius={radii.control}
            gap={2}
            renderItem={(item) => (
              <>
                <span className="ingredient-index">{String(item.index + 1).padStart(2, '0')}</span>
                <span className="ingredient-name">
                  <span>{item.title}</span>
                  {item.original && (
                    <small lang="en" dir="auto">
                      {item.original}
                    </small>
                  )}
                </span>
              </>
            )}
          />
        </div>
      ) : (
        <p className="ingredient-statement">
          {summary.text ||
            'No ingredient list was identified. Try a clearer image of the ingredients section.'}
        </p>
      )}
      {!compact && summary.text && (
        <details className="ingredient-statement-detail">
          <summary>Original ingredient statement</summary>
          <p>{summary.text}</p>
        </details>
      )}
    </div>
  );
}
