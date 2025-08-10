import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { storageService, storageKeys } from '../utils/config';

export const useAuth = () => {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useClerkAuth();
  const { user } = useUser();
  
  // Get user profile from our API
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery(
    ['user', 'profile'],
    () => apiService.auth.me(),
    {
      enabled: isSignedIn && isLoaded,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
  
  // Get user stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery(
    ['user', 'stats'],
    () => apiService.auth.getStats(),
    {
      enabled: isSignedIn && isLoaded,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => apiService.auth.updateProfile(data),
    {
      onSuccess: () => {
        refetchProfile();
        refetchStats();
      },
    }
  );
  
  // Get user preferences from localStorage
  const getUserPreferences = () => {
    return storageService.get(storageKeys.userPreferences) || {
      theme: 'light',
      notifications: true,
      maxDistance: 25,
      defaultLocation: null,
    };
  };
  
  // Save user preferences to localStorage
  const saveUserPreferences = (preferences) => {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    storageService.set(storageKeys.userPreferences, updated);
  };
  
  // Get user's recent searches
  const getRecentSearches = () => {
    return storageService.get(storageKeys.recentSearches) || [];
  };
  
  // Add search to recent searches
  const addRecentSearch = (search) => {
    const searches = getRecentSearches();
    const filtered = searches.filter(s => s.query !== search.query);
    const updated = [search, ...filtered].slice(0, 10); // Keep last 10
    storageService.set(storageKeys.recentSearches, updated);
  };
  
  // Get saved filters
  const getSavedFilters = () => {
    return storageService.get(storageKeys.savedFilters) || [];
  };
  
  // Save filter
  const saveFilter = (filter) => {
    const filters = getSavedFilters();
    const filtered = filters.filter(f => f.name !== filter.name);
    const updated = [filter, ...filtered].slice(0, 5); // Keep last 5
    storageService.set(storageKeys.savedFilters, updated);
  };
  
  // Delete saved filter
  const deleteSavedFilter = (filterName) => {
    const filters = getSavedFilters();
    const updated = filters.filter(f => f.name !== filterName);
    storageService.set(storageKeys.savedFilters, updated);
  };
  
  // Check if user has specific role
  const hasRole = (role) => {
    if (!profile) return false;
    return profile.accountType === role || profile.accountType === 'both';
  };
  
  // Check if user is verified
  const isVerified = () => {
    return profile?.isVerified || false;
  };
  
  // Get user's location
  const getUserLocation = () => {
    return profile?.location || null;
  };
  
  // Get user's skills
  const getUserSkills = () => {
    return profile?.skills || [];
  };
  
  // Get user's rating
  const getUserRating = () => {
    return profile?.rating || { average: 0, totalReviews: 0 };
  };
  
  // Check if user can post jobs
  const canPostJobs = () => {
    return isSignedIn && (hasRole('client') || hasRole('both'));
  };
  
  // Check if user can accept jobs
  const canAcceptJobs = () => {
    return isSignedIn && (hasRole('helper') || hasRole('both'));
  };
  
  // Get user's account type
  const getAccountType = () => {
    return profile?.accountType || 'client';
  };
  
  // Get user's full name
  const getFullName = () => {
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return profile?.fullName || '';
  };
  
  // Get user's display name
  const getDisplayName = () => {
    const fullName = getFullName();
    return fullName || user?.emailAddresses?.[0]?.emailAddress || 'User';
  };
  
  // Get user's profile image
  const getProfileImage = () => {
    return profile?.profileImage || user?.imageUrl || null;
  };
  
  // Check if user has completed profile
  const hasCompletedProfile = () => {
    if (!profile) return false;
    return !!(profile.firstName && profile.lastName && profile.location?.coordinates);
  };
  
  // Get user's notification settings
  const getNotificationSettings = () => {
    return profile?.preferences?.notificationSettings || {
      email: true,
      push: true,
      sms: false,
    };
  };
  
  // Get user's availability
  const getAvailability = () => {
    return profile?.preferences?.availability || {};
  };
  
  // Get user's max distance preference
  const getMaxDistance = () => {
    return profile?.preferences?.maxDistance || 25;
  };
  
  // Check if user is online
  const isOnline = () => {
    return isSignedIn && isLoaded;
  };
  
  // Get user's member since date
  const getMemberSince = () => {
    return profile?.stats?.memberSince || profile?.createdAt || null;
  };
  
  // Get user's job statistics
  const getJobStats = () => {
    return stats || {
      jobsPosted: 0,
      jobsAccepted: 0,
      jobsCompleted: 0,
      totalEarnings: 0,
    };
  };
  
  // Get user's earnings
  const getEarnings = () => {
    return stats?.totalEarnings || 0;
  };
  
  // Get user's completion rate
  const getCompletionRate = () => {
    if (!stats) return 0;
    const total = stats.jobsPosted + stats.jobsAccepted;
    if (total === 0) return 0;
    return Math.round((stats.jobsCompleted / total) * 100);
  };
  
  // Check if user is new (less than 30 days)
  const isNewUser = () => {
    const memberSince = getMemberSince();
    if (!memberSince) return true;
    const daysSince = (Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  };
  
  return {
    // Clerk auth state
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    getToken,
    user,
    
    // Profile data
    profile,
    profileLoading,
    profileError,
    refetchProfile,
    
    // Stats data
    stats,
    statsLoading,
    statsError,
    refetchStats,
    
    // Mutations
    updateProfile: updateProfileMutation.mutate,
    updateProfileLoading: updateProfileMutation.isLoading,
    
    // User preferences
    getUserPreferences,
    saveUserPreferences,
    
    // Recent searches
    getRecentSearches,
    addRecentSearch,
    
    // Saved filters
    getSavedFilters,
    saveFilter,
    deleteSavedFilter,
    
    // User checks
    hasRole,
    isVerified,
    canPostJobs,
    canAcceptJobs,
    hasCompletedProfile,
    isOnline,
    isNewUser,
    
    // User data getters
    getUserLocation,
    getUserSkills,
    getUserRating,
    getAccountType,
    getFullName,
    getDisplayName,
    getProfileImage,
    getNotificationSettings,
    getAvailability,
    getMaxDistance,
    getMemberSince,
    getJobStats,
    getEarnings,
    getCompletionRate,
  };
};