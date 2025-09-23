import React, { useMemo, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth as useAppAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../UI/Button';
import { storageService, storageKeys } from '../../utils/config';

const DISMISS_KEY = 'fixify-onboarding-dismissed-at';
const DISMISS_DURATION_MS =   60 * 1000; // 1 day

const Layout = ({ children }) => {
  const { isAuthReady, isSignedIn, hasCompletedProfile } = useAppAuth();
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (!isAuthReady || !isSignedIn) {
      setBannerVisible(false);
      return;
    }
    // Backward compatibility: legacy boolean key
    const legacyDismissed = storageService.get(`${storageKeys.userPreferences}:onboardingDismissed`) || false;
    if (legacyDismissed) {
      // Migrate to timestamp-based and clear legacy
      storageService.set(DISMISS_KEY, Date.now());
      storageService.remove?.(`${storageKeys.userPreferences}:onboardingDismissed`);
    }
    const dismissedAt = storageService.get(DISMISS_KEY);
    const isExpired = !dismissedAt || (Date.now() - Number(dismissedAt)) > DISMISS_DURATION_MS;
    // If profile complete, permanently hide banner
    if (hasCompletedProfile()) {
      setBannerVisible(false);
      return;
    }
    setBannerVisible(isExpired);
  }, [isAuthReady, isSignedIn, hasCompletedProfile]);

  const handleDismiss = () => {
    storageService.set(DISMISS_KEY, Date.now());
    setBannerVisible(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50 dark:bg-secondary-900">
      <Header />

      {bannerVisible && (
        <div className="bg-primary-50 dark:bg-primary-900/30 border-b border-primary-200 dark:border-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="text-sm text-primary-900 dark:text-primary-100">
              Complete your profile to get better job recommendations and distance-based results.
            </div>
            <div className="flex items-center gap-2">
              <Link to="/onboarding" className="hidden sm:block">
                <Button size="sm" variant="primary">Complete profile</Button>
              </Link>
              <button onClick={handleDismiss} className="text-sm text-primary-700 dark:text-primary-300 underline">
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;