import './home.css';
import { usePipelinePlayback } from '../../hooks/usePipelinePlayback';
import PipelineUploadGraphic from './PipelineUploadGraphic';
import { PIPELINE_STEPS } from './pipelineSteps';
import { ArrowLeft, ArrowRight, Check, Leaf, Pause, Play } from 'lucide-react';

export default function HomePage() {
  const { selected, playing, fillRef, progressRef, skip, togglePlaying } = usePipelinePlayback(
    PIPELINE_STEPS.length,
  );
  const stage = PIPELINE_STEPS[selected];
  const Icon = stage.icon;
  return (
    <main className="home-page">
      <section className="home-intro">
        <div>
          <span className="home-eyebrow">BEHIND THE LABEL</span>
          <h1>
            See beyond
            <br />
            the <span>packaging.</span>
          </h1>
          <p className="home-tagline">Know what you eat.</p>
        </div>
        <a className="primary-button home-start" href="#/extract">
          Extract ingredients <ArrowRight size={17} />
        </a>
      </section>
      <section className="pipeline-explainer" aria-label="How ingredient extraction works">
        <div className="pipeline-heading">
          <div className="pipeline-title">
            <h2>How it works</h2>
            <span>{playing ? 'Auto-playing' : 'Walkthrough paused'}</span>
          </div>
          <div className="playback-controls">
            <button
              className="icon-button"
              onClick={() => skip(-1)}
              aria-label="Previous pipeline step"
              title="Previous step"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              className="playback-toggle"
              onClick={togglePlaying}
              aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              className="icon-button"
              onClick={() => skip(1)}
              aria-label="Next pipeline step"
              title="Next step"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div
          className="pipeline-timeline"
          ref={progressRef}
          role="progressbar"
          aria-label={`Step ${selected + 1} of ${PIPELINE_STEPS.length}: ${stage.short}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${stage.short}, step ${selected + 1} of ${PIPELINE_STEPS.length}`}
        >
          {PIPELINE_STEPS.map((item, index) => (
            <div
              className={`timeline-step ${index === selected ? 'active' : index < selected ? 'complete' : ''}`}
              key={item.short}
            >
              <div className="timeline-track">
                <span
                  key={`${item.short}-${selected}`}
                  ref={index === selected ? fillRef : null}
                  style={{ transform: `scaleX(${index < selected ? 1 : 0})` }}
                />
              </div>
              <div className="timeline-label">
                <span>0{index + 1}</span>
                {item.short}
              </div>
            </div>
          ))}
        </div>
        <div
          className="pipeline-detail"
          id="stage-detail"
          role="region"
          aria-label={`${stage.short}: pipeline explanation`}
        >
          <div className="stage-description">
            <span className="stage-tool">
              <Icon size={15} />
              {stage.tool}
            </span>
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
          </div>
          <div className="stage-example">
            <div className="example-caption">
              <span>Example</span>
              <span>0{selected + 1} / 05</span>
            </div>
            {selected === 0 ? (
              <PipelineUploadGraphic />
            ) : Array.isArray(stage.example) ? (
              <ul className="example-ingredients">
                {stage.example.map((ingredient) => (
                  <li key={ingredient}>
                    <Check size={16} />
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <pre className={selected === 1 ? 'example-detected' : ''}>{stage.example}</pre>
            )}
            <div className="example-footer">
              <Leaf size={13} />
              Sample only
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
