import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Clock,
  DollarSign,
  User,
  Calendar,
  Star,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { getToken } = useClerkAuth();

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      console.log('Fetching job details for ID:', id);

      try {
        // Always try with auth token first
        const token = await getToken();

        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
          headers
        });

        console.log('Job detail response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Job detail data:', data);
          return data.data || data;
        } else {
          const errorText = await response.text();
          console.error('Job detail fetch failed:', response.status, errorText);
          throw new Error(`Failed to fetch job: ${response.status}`);
        }
      } catch (error) {
        console.error('Job detail error:', error);
        throw error;
      }
    },
    retry: 1
  });

  // Accept job mutation
  const acceptJobMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept job');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Job accepted successfully!');
      queryClient.invalidateQueries(['job', id]);
      queryClient.invalidateQueries(['jobs']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept job');
    }
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatBudget = (min, max) => {
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
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

  const canAcceptJob = () => {
    const userId = profile?.data?.data?._id;
    return job &&
           job.status === 'open' &&
           userId &&
           job.creator?._id !== userId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              Job Not Found
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Job Header */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {job.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {job.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                </span>
                {profile?.data?.data?._id && job.creator?._id === profile.data.data._id && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                    YOUR JOB
                  </span>
                )}
                {job.isUrgent && (
                  <span className="px-2 py-1 bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200 rounded-full text-xs font-medium">
                    URGENT
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                Posted {formatDate(job.createdAt)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatBudget(job.budget?.min, job.budget?.max)}
              </div>
              {job.budget?.isNegotiable && (
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Negotiable
                </div>
              )}
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
              <MapPin className="w-4 h-4 mr-2" />
              {job.location?.address?.city && job.location?.address?.state
                ? `${job.location.address.city}, ${job.location.address.state}`
                : 'Location not specified'
              }
            </div>

            <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
              <Clock className="w-4 h-4 mr-2" />
              {job.preferredDate ? formatDate(job.preferredDate) : 'Date flexible'}
            </div>

            <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
              <User className="w-4 h-4 mr-2" />
              {job.category}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canAcceptJob() && (
              <button
                onClick={() => acceptJobMutation.mutate()}
                disabled={acceptJobMutation.isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {acceptJobMutation.isLoading ? 'Accepting...' : 'Accept Job'}
              </button>
            )}

            {job.creator && (
              <Link
                to={`/messages?user=${job.creator._id}`}
                className="inline-flex items-center px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Link>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Job Description
          </h2>
          <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Location & Timing */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Location & Timing
            </h3>

            <div className="space-y-3">
              {job.location?.address && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Address
                  </h4>
                  <div className="text-secondary-600 dark:text-secondary-400">
                    {job.location.address.street && (
                      <div>{job.location.address.street}</div>
                    )}
                    <div>
                      {job.location.address.city && `${job.location.address.city}, `}
                      {job.location.address.state} {job.location.address.zipCode}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Preferred Date
                </h4>
                <div className="text-secondary-600 dark:text-secondary-400">
                  {job.preferredDate ? formatDate(job.preferredDate) : 'Flexible'}
                </div>
              </div>

              {job.preferredTime && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Preferred Time
                  </h4>
                  <div className="text-secondary-600 dark:text-secondary-400">
                    {formatTime(job.preferredTime.start)} - {formatTime(job.preferredTime.end)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Requirements
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Experience Level
                </h4>
                <div className="text-secondary-600 dark:text-secondary-400 capitalize">
                  {job.requirements?.experienceLevel || 'Any'}
                </div>
              </div>

              {job.requirements?.skills && job.requirements.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {job.requirements?.verifiedOnly && (
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <CheckCircle className="w-4 h-4 mr-2 text-success-500" />
                    Verified professionals only
                  </div>
                )}

                {job.requirements?.backgroundCheck && (
                  <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                    <CheckCircle className="w-4 h-4 mr-2 text-success-500" />
                    Background check required
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Creator */}
        {job.creator && (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Posted By
            </h3>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                {job.creator.profileImage ? (
                  <img
                    src={job.creator.profileImage}
                    alt={`${job.creator.firstName} ${job.creator.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 dark:text-primary-400 font-medium">
                    {job.creator.firstName?.[0]}{job.creator.lastName?.[0]}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                  {job.creator.firstName} {job.creator.lastName}
                </h4>

                {job.creator.rating && (
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-warning-500 mr-1" />
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {job.creator.rating.average?.toFixed(1)} ({job.creator.rating.totalReviews} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-3">
                  <Link
                    to={`/messages?user=${job.creator._id}`}
                    className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Link>

                  {job.creator.email && (
                    <a
                      href={`mailto:${job.creator.email}`}
                      className="inline-flex items-center text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;