import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useTheme } from '../Providers/ThemeProvider';
import { Moon, Sun, Menu, X } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
              Fixify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/browse"
              className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
            >
              Browse Jobs
            </Link>
            
            <SignedIn>
              <Link
                to="/post-job"
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
              >
                Post Job
              </Link>
              <Link
                to="/dashboard"
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
              >
                Dashboard
              </Link>
            </SignedIn>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User menu */}
            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <Link
                to="/auth"
                className="btn btn-primary"
              >
                Sign In
              </Link>
            </SignedOut>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200 dark:border-secondary-700">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/browse"
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              
              <SignedIn>
                <Link
                  to="/post-job"
                  className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Job
                </Link>
                <Link
                  to="/dashboard"
                  className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </SignedIn>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 