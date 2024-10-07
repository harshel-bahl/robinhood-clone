import Layout from './components/Layout';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TradePage from './pages/Trade';
import PortfolioPage from './pages/Portfolio';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/shadcn/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<PortfolioPage />} />
              <Route path="/trade" element={<TradePage />} />
            </Routes>
            <Toaster />
          </ErrorBoundary>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
