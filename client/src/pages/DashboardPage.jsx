import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  Star,
  Clock,
  MapPin,
  Plus,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const DashboardPage = () => {
  console.log('DashboardPage component is rendering!');

  const { user } = useAuth();

  // Mock data for testing
  const myJobs = [
    {
      _id: '1',
      title: 'Fix Kitchen Faucet',
      description: 'Need someone to fix a leaky kitchen faucet',
      budget: { min: 50, max: 100 },
      status: 'open',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Paint Living Room',
      description: 'Looking for someone to paint my living room',
      budget: { min: 200, max: 400 },
      status: 'in_progress',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const stats = {
    jobsPosted: 5,
    jobsCompleted: 3,
    totalEarnings: 850
  };

  const notifications = [
    {
      _id: '1',
      title: 'New job application',
      message: 'Someone applied to your kitchen faucet job',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Job completed',
      message: 'Your painting job has been marked as completed',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const jobsLoading = false;
  const statsLoading = false;
  const notificationsLoading = false;

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

  if (jobsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Here's what's happening with your jobs and services.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Jobs</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats?.jobsPosted || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Completed</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats?.jobsCompleted || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Rating</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {user?.rating?.average?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Earnings</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  ${stats?.totalEarnings || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    My Jobs
                  </h2>
                  <Link
                    to="/post-job"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {myJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                      No jobs yet
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                      Start by posting your first job to find local professionals.
                    </p>
                    <Link
                      to="/post-job"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myJobs.slice(0, 5).map((job) => (
                      <Link
                        key={job._id}
                        to={`/jobs/${job._id}`}
                        className="block p-4 border border-secondary-200 dark:border-secondary-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-secondary-500 dark:text-secondary-400">
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                ${job.budget?.min} - ${job.budget?.max}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(job.createdAt)}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </Link>
                    ))}

                    {myJobs.length > 5 && (
                      <div className="text-center pt-4">
                        <Link
                          to="/browse"
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          View all jobs →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Recent Activity
                </h2>
              </div>

              <div className="p-6">
                {notificationsLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification._id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 mt-6">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Quick Actions
                </h2>
              </div>

              <div className="p-6 space-y-3">
                <Link
                  to="/post-job"
                  className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    Post a Job
                  </span>
                </Link>

                <Link
                  to="/browse"
                  className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    Browse Jobs
                  </span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    Edit Profile
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;