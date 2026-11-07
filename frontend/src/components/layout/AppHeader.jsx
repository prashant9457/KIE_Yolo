import { Leaf } from 'lucide-react';

export default function AppHeader({ page, busy }) {
  return (
    <header className="topbar">
      <a className="brand" href="#/" aria-label="Ingredient home">
        <Leaf size={24} />
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
      <span className="local-badge">
        <span />
        {busy ? 'Processing' : 'Ready'}
      </span>
    </header>
  );
}
