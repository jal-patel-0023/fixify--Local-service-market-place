import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../Providers/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/Button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const navigation = [
    { name: 'Browse Jobs', href: '/browse' },
    { name: 'Post Job', href: '/post-job' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Messages', href: '/messages' },
  ];

  // Add admin link for admin users
  if (user?.isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin' });
  }

  // Add admin link for admin users
  if (user?.isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin' });
  }

  return (
    <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                Fixify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Menu */}
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link to="/auth">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            </SignedOut>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-secondary-200 dark:border-secondary-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 