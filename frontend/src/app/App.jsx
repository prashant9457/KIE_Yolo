import '../components/common/common.css';
import './app.css';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';
import HomePage from '../pages/home/HomePage';
import ExtractPage from '../pages/extract/ExtractPage';
import { useExtraction } from '../hooks/useExtraction';
import { usePageNavigation } from '../hooks/usePageNavigation';

export default function App() {
  const flow = useExtraction();
  const page = usePageNavigation();
  return (
    <div className="app-shell">
      <AppHeader page={page} busy={flow.isLoading || flow.isLLMLoading} />
      {page === 'home' && <HomePage />}
      <ExtractPage flow={flow} active={page === 'extract'} />
      <AppFooter />
    </div>
  );
}
