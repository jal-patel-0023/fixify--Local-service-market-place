import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';

// Components
import Layout from './components/Layout/Layout';
import ThemeProvider from './components/Providers/ThemeProvider';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorFallback from './components/UI/ErrorFallback';

// Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import JobDetailPage from './pages/JobDetailPage';
import PostJobPage from './pages/PostJobPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

// Hooks
import { useAuth } from './hooks/useAuth';

// Utils
import { clerkPublishableKey } from './utils/config';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/post-job"
            element={
              <SignedIn>
                <PostJobPage />
              </SignedIn>
            }
          />
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <DashboardPage />
              </SignedIn>
            }
          />
          <Route
            path="/profile"
            element={
              <SignedIn>
                <ProfilePage />
              </SignedIn>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <ThemeProvider>
              <AppContent />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                }}
              />
            </ThemeProvider>
          </ClerkProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
