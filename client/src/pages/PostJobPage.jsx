import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Clock, FileText, Tag } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const PostJobPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { getToken } = useClerkAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: {
      min: '',
      max: '',
      isNegotiable: true
    },
    location: {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    preferredDate: '',
    preferredTime: {
      start: '09:00',
      end: '17:00'
    },
    isUrgent: false,
    requirements: {
      skills: [],
      experienceLevel: 'any',
      verifiedOnly: false,
      backgroundCheck: false
    }
  });

  const categories = [
    'plumbing', 'electrical', 'carpentry', 'cleaning',
    'gardening', 'painting', 'moving', 'repair', 'other'
  ];

  const experienceLevels = [
    { value: 'any', label: 'Any Experience Level' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];

  const createJobMutation = useMutation({
    mutationFn: async (jobData) => {
      console.log('Posting job with data:', jobData);

      try {
        // Get authentication token
        const token = await getToken();
        console.log('Got auth token:', token ? 'Yes' : 'No');

        // Try direct fetch first to test server connectivity
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const directResponse = await fetch('http://localhost:5000/api/jobs', {
          method: 'POST',
          headers,
          body: JSON.stringify(jobData)
        });

        console.log('Direct fetch response status:', directResponse.status);

        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('Direct fetch success:', directData);
          return directData.data || directData;
        } else {
          const errorText = await directResponse.text();
          console.error('Direct fetch failed:', directResponse.status, errorText);
          throw new Error(`Server error: ${directResponse.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.error('Direct fetch error:', fetchError);

        // Fallback to apiService
        try {
          const response = await apiService.jobs.create(jobData);
          console.log('API service success:', response);
          return response.data || response;
        } catch (apiError) {
          console.error('API service error:', apiError);
          throw apiError;
        }
      }
    },
    onSuccess: (data) => {
      console.log('Job creation successful:', data);
      toast.success('Job posted successfully!');
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['my-jobs']);

      // Navigate to dashboard if no job ID, otherwise to job detail
      if (data?._id) {
        navigate(`/jobs/${data._id}`);
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Job creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to post job';
      toast.error(errorMessage);
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('address.')) {
      // Handle address fields specifically
      const field = name.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: {
            ...prev.location.address,
            [field]: value
          }
        }
      }));
    } else if (name.includes('.')) {
      // Handle other nested fields
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submission started');
    console.log('Current form data:', formData);

    // Basic validation
    if (!formData.title.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.budget.min || !formData.budget.max) {
      toast.error('Please enter budget range');
      return;
    }

    if (parseInt(formData.budget.min) > parseInt(formData.budget.max)) {
      toast.error('Minimum budget cannot be higher than maximum budget');
      return;
    }

    if (!formData.preferredDate) {
      toast.error('Please select a preferred date');
      return;
    }

    // Prepare data for submission
    const jobData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      budget: {
        min: parseInt(formData.budget.min),
        max: parseInt(formData.budget.max),
        isNegotiable: formData.budget.isNegotiable
      },
      location: {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates [longitude, latitude]
        address: {
          street: formData.location.address.street || '',
          city: formData.location.address.city || '',
          state: formData.location.address.state || '',
          zipCode: formData.location.address.zipCode || '',
          country: formData.location.address.country || 'US'
        }
      },
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      isUrgent: formData.isUrgent,
      requirements: {
        ...formData.requirements,
        skills: [formData.category] // Add selected category as required skill
      }
    };

    console.log('Prepared job data for submission:', jobData);
    createJobMutation.mutate(jobData);
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Post a Job
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Describe your project and find the right professional for the job.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Fix leaky kitchen faucet"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what needs to be done, any specific requirements, and what you expect..."
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Experience Level
                </label>
                <select
                  name="requirements.experienceLevel"
                  value={formData.requirements.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Budget
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Minimum Budget ($) *
                </label>
                <input
                  type="number"
                  name="budget.min"
                  value={formData.budget.min}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="50"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Maximum Budget ($) *
                </label>
                <input
                  type="number"
                  name="budget.max"
                  value={formData.budget.max}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="200"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="budget.isNegotiable"
                    checked={formData.budget.isNegotiable}
                    onChange={handleInputChange}
                    className="rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                    Budget is negotiable
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.location.address.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.location.address.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.location.address.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.location.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Timing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="preferredTime.start"
                  value={formData.preferredTime.start}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="preferredTime.end"
                  value={formData.preferredTime.end}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                    This is an urgent job
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Requirements
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requirements.verifiedOnly"
                    checked={formData.requirements.verifiedOnly}
                    onChange={handleInputChange}
                    className="rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                    Only verified professionals
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requirements.backgroundCheck"
                    checked={formData.requirements.backgroundCheck}
                    onChange={handleInputChange}
                    className="rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">
                    Background check required
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createJobMutation.isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createJobMutation.isLoading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;