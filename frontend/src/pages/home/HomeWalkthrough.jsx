import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import Surface from '../../components/ui/Surface';
import Button from '../../components/ui/Button';
import IngredientList from '../extract/components/IngredientList';
import { getIngredientSummary } from '../../services/ingredients';
import { SAMPLE_INGREDIENTS } from './sample';
import sampleLabel from '../../assets/sample-label.png';

const STEPS = [
  {
    title: 'Upload a label',
    description: 'Choose a clear photo of the ingredients on your package.',
  },
  {
    title: 'Let the details come into focus',
    description: 'Text detection and recognition turn the image into an ingredient list.',
  },
  {
    title: 'Make it your own',
    description: 'Switch languages, save your results, or ask a question about the label.',
  },
];

export default function HomeWalkthrough() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('original');
  return (
    <section className="home-walkthrough" aria-labelledby="walkthrough-title">
      <div className="home-walkthrough__intro">
        <h2 id="walkthrough-title">From a photo to a little more understanding.</h2>
        <p>Three steps. All in one workspace.</p>
      </div>
      <div className="home-walkthrough__grid">
        <div
          className="walkthrough-steps"
          role="tablist"
          aria-label="How ingredient extraction works"
          aria-orientation="vertical"
        >
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              id={`walkthrough-${index}`}
              aria-selected={step === index}
              aria-controls="walkthrough-example"
              tabIndex={step === index ? 0 : -1}
              onClick={() => setStep(index)}
              onKeyDown={(event) => {
                const next =
                  event.key === 'ArrowDown'
                    ? (step + 1) % 3
                    : event.key === 'ArrowUp'
                      ? (step + 2) % 3
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? 2
                          : null;
                if (next === null) return;
                event.preventDefault();
                setStep(next);
                event.currentTarget.parentElement.querySelector(`#walkthrough-${next}`)?.focus();
              }}
            >
              <span className="walkthrough-step-number">{index + 1}</span>
              <span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
            </button>
          ))}
          <div className="walkthrough-navigation">
            <Button
              size="sm"
              iconOnly
              variant="ghost"
              aria-label="Previous example"
              onClick={() => setStep((step + 2) % 3)}
            >
              <ArrowLeftIcon />
            </Button>
            <span>{step + 1} of 3</span>
            <Button
              size="sm"
              iconOnly
              variant="ghost"
              aria-label="Next example"
              onClick={() => setStep((step + 1) % 3)}
            >
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
        <Surface className="walkthrough-example" aria-label="Sample extraction" as="div">
          <div className="walkthrough-example__heading">
            Sample label
            <span>{step === 0 ? 'Image' : step === 1 ? 'Detected text' : 'Ingredients'}</span>
          </div>
          <div id="walkthrough-example" role="tabpanel" aria-labelledby={`walkthrough-${step}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 ? (
                  <div className="walkthrough-photo">
                    <img
                      src={sampleLabel}
                      alt="Sample product label"
                      width="1122"
                      height="1402"
                      loading="lazy"
                    />
                  </div>
                ) : step === 1 ? (
                  <div className="walkthrough-transcript">
                    <span>INGREDIENTS</span>
                    <p>{SAMPLE_INGREDIENTS.postprocessed_corrected_text}</p>
                    <small>The ingredient statement, separated from the rest of the package.</small>
                  </div>
                ) : (
                  <IngredientList
                    summary={getIngredientSummary(SAMPLE_INGREDIENTS)}
                    structured={SAMPLE_INGREDIENTS}
                    language={language}
                    onLanguageChange={setLanguage}
                    compact
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Surface>
      </div>
    </section>
  );
}
