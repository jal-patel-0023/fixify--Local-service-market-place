import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, User, Filter, Search } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const BrowsePage = () => {
  console.log('BrowsePage component is rendering!');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch jobs from API
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs', searchTerm, selectedCategory, sortBy],
    queryFn: async () => {
      console.log('Fetching jobs from API...');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('sort', sortBy);

      try {
        // Try direct fetch first to test server connectivity
        const directResponse = await fetch(`http://localhost:5000/api/jobs?${params.toString()}`);
        console.log('Direct fetch response status:', directResponse.status);

        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('Direct fetch data:', directData);
          return directData.data || directData || [];
        } else {
          console.error('Direct fetch failed:', directResponse.status, directResponse.statusText);
        }

        // Fallback to apiService
        const response = await apiService.get(`/jobs?${params.toString()}`);
        console.log('Jobs API response:', response);
        return response.data || [];
      } catch (error) {
        console.error('Jobs API error:', error);

        // Return mock data for testing
        return [
          {
            _id: '1',
            title: 'Fix Kitchen Faucet',
            description: 'Need someone to fix a leaky kitchen faucet',
            category: 'plumbing',
            budget: { min: 50, max: 100 },
            location: { address: { city: 'New York', state: 'NY' } },
            status: 'open',
            preferredDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            creator: { firstName: 'John', lastName: 'Doe' }
          },
          {
            _id: '2',
            title: 'Paint Living Room',
            description: 'Looking for someone to paint my living room',
            category: 'painting',
            budget: { min: 200, max: 400 },
            location: { address: { city: 'Los Angeles', state: 'CA' } },
            status: 'open',
            preferredDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            creator: { firstName: 'Jane', lastName: 'Smith' }
          }
        ];
      }
    },
    retry: 1
  });

  const categories = [
    'plumbing', 'electrical', 'carpentry', 'cleaning',
    'gardening', 'painting', 'moving', 'repair'
  ];

  const formatBudget = (min, max) => {
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'accepted': return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'in_progress': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'completed': return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Browse Jobs
            </h1>
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 rounded-lg p-4">
              <p className="text-error-800 dark:text-error-200">
                Failed to load jobs. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Browse Jobs
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Find local service opportunities in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-secondary-600 dark:text-secondary-400">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              No jobs found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-shadow duration-200 p-6 block"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {job.isUrgent && (
                    <span className="px-2 py-1 bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200 rounded-full text-xs font-medium">
                      URGENT
                    </span>
                  )}
                </div>

                {/* Job Title */}
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2 line-clamp-2">
                  {job.title}
                </h3>

                {/* Description */}
                <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatBudget(job.budget?.min, job.budget?.max)}
                  </div>

                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location?.address?.city}, {job.location?.address?.state}
                  </div>

                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(job.preferredDate)}
                  </div>

                  {job.creator && (
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <User className="w-4 h-4 mr-2" />
                      {job.creator.firstName} {job.creator.lastName}
                    </div>
                  )}
                </div>

                {/* Category Tag */}
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-xs font-medium">
                    {job.category}
                  </span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    {formatDate(job.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;