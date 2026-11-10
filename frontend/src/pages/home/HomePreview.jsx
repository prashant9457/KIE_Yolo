import Surface from '../../components/ui/Surface';
import sampleLabel from '../../assets/sample-label.png';
import { SAMPLE_INGREDIENTS } from './sample';

export default function HomePreview() {
  return (
    <Surface
      className="home-preview"
      as="figure"
      aria-label="Example package and its ingredient list"
    >
      <div className="home-preview__photo">
        <img
          src={sampleLabel}
          alt="Sample oat and almond granola package with its ingredient label"
          width="1122"
          height="1402"
          fetchPriority="high"
        />
      </div>
      <div className="home-preview__result">
        <span className="home-preview__caption">Example result</span>
        <h2>
          Small print.
          <br />
          Clear ingredients.
        </h2>
        <ol>
          {SAMPLE_INGREDIENTS.ingredients.map((ingredient, index) => (
            <li key={ingredient}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {ingredient}
            </li>
          ))}
        </ol>
        <span className="home-preview__count">5 ingredients identified</span>
      </div>
    </Surface>
  );
}
