import React from 'react';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Authentication
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            This page will contain Clerk authentication components.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 