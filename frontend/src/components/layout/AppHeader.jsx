import { LeafIcon } from '@phosphor-icons/react';
import AppFeedback from './AppFeedback';

export default function AppHeader({ page }) {
  return (
    <header className="topbar">
      <a className="brand" href="#/" aria-label="Ingredient home">
        <span className="brand-mark">
          <LeafIcon size={21} weight="light" />
        </span>
        <span>
          ingredient<span className="brand-dot">.</span>
        </span>
      </a>
      <nav className="page-nav" aria-label="Main navigation">
        <a href="#/" aria-current={page === 'home' ? 'page' : undefined}>
          How it works
        </a>
        <a href="#/extract" aria-current={page === 'extract' ? 'page' : undefined}>
          Extract ingredients
        </a>
      </nav>
      <AppFeedback />
    </header>
  );
}
