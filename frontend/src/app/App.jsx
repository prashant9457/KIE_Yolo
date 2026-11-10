import { IconContext } from '@phosphor-icons/react';
import { MotionConfig } from 'motion/react';
import './app.css';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';
import HomePage from '../pages/home/HomePage';
import ExtractPage from '../pages/extract/ExtractPage';
import { useExtraction } from '../hooks/useExtraction';
import { usePageNavigation } from '../hooks/usePageNavigation';
import { themeVariables, easing } from '../styles/theme';

const ICON_DEFAULTS = { weight: 'light', size: 18 };

export default function App() {
  const flow = useExtraction();
  const page = usePageNavigation();
  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: easing }}>
        <div className="app-shell" style={themeVariables}>
          <a
            className="skip-link"
            href="#main-content"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById('main-content')?.focus();
            }}
          >
            Skip to content
          </a>
          <AppHeader page={page} />
          {page === 'home' && <HomePage />}
          <ExtractPage flow={flow} active={page === 'extract'} />
          <AppFooter />
        </div>
      </MotionConfig>
    </IconContext.Provider>
  );
}
