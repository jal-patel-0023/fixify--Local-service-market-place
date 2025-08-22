import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import MyJobsPage from './pages/MyJobsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import MessagingPage from './components/Messaging/MessagingPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminJobsPage from './pages/AdminJobsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Hooks
import { useAuth } from './hooks/useAuth';

// Utils
import { registerAuthTokenGetter } from './services/api';

// PWA Service Worker Registration
// Disable SW registration during dev to avoid MIME errors
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

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
  const { isLoaded, getToken } = useAuth();
  // Register token getter once
  useEffect(() => {
    registerAuthTokenGetter(() => getToken());
  }, [getToken]);

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
            path="/my-jobs"
            element={
              <SignedIn>
                <MyJobsPage />
              </SignedIn>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <SignedIn>
                <SavedJobsPage />
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
          <Route
            path="/messages"
            element={
              <SignedIn>
                <MessagingPage />
              </SignedIn>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <SignedIn>
                <AdminPage />
              </SignedIn>
            }
          />
          <Route
            path="/admin/users"
            element={
              <SignedIn>
                <AdminUsersPage />
              </SignedIn>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <SignedIn>
                <AdminJobsPage />
              </SignedIn>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <SignedIn>
                <AdminReviewsPage />
              </SignedIn>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <SignedIn>
                <AdminAnalyticsPage />
              </SignedIn>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <SignedIn>
                <AdminSettingsPage />
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
          <ThemeProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#222',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontWeight: 500,
                  fontSize: '1rem',
                  opacity: 1,
                },
                className: 'dark:bg-blue-900 dark:text-white',
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
