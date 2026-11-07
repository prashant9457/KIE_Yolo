import { useEffect, useState } from 'react';

const currentPage = () =>
  ['#/extract', '#/workspace'].includes(window.location.hash) ? 'extract' : 'home';

export function usePageNavigation() {
  const [page, setPage] = useState(currentPage);
  useEffect(() => {
    const sync = () => setPage(currentPage());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return page;
}
