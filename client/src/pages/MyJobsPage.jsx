import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Users,
  X,
  Plus,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Card from '../components/UI/Card';
import JobForm from '../components/Jobs/JobForm';
import toast from 'react-hot-toast';

const MyJobsPage = () => {
  const { user, isLoaded, isSignedIn, tokenReady } = useAuth();
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch user's jobs
  const { data: myJobs = [], isLoading, error } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => {
      try {
        const response = await apiService.jobs.myJobs();
        const jobs = response.data?.data || response.data || response || [];
        return Array.isArray(jobs) ? jobs : [];
      } catch (error) {
        console.error('Failed to fetch my jobs:', error);
        return [];
      }
    },
    enabled: !!user && isLoaded && isSignedIn && tokenReady
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.jobs.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job updated successfully');
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      setShowEditForm(false);
      setEditingJob(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job');
    }
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiService.jobs.delete(id);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accepted':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200';
    }
  };

  const formatBudget = (job) => {
    if (typeof job.budget === 'number') {
      return `$${job.budget}`;
    } else if (job.minBudget && job.maxBudget) {
      return `$${job.minBudget} - $${job.maxBudget}`;
    } else if (job.minBudget) {
      return `$${job.minBudget}+`;
    }
    return 'Budget not specified';
  };

  const formatLocation = (location) => {
    if (!location) return 'Remote';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.address) {
      // If address is an object with street, city, state, etc., format it properly
      if (typeof location.address === 'object' && location.address.street) {
        const { street, city, state, zipCode, country } = location.address;
        return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
      }
      // If address is a string, return it directly
      if (typeof location.address === 'string') {
        return location.address;
      }
    }
    return 'Remote';
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowEditForm(true);
  };

  const handleDeleteJob = (job) => {
    if (window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      deleteJobMutation.mutate(job._id);
    }
  };

  const handleUpdateJob = (data) => {
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob._id, data });
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingJob(null);
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
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Error Loading Jobs
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            Failed to load your jobs. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Jobs
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Manage and track all your job posts
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/post-job"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myJobs.length}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myJobs.filter(job => job.status === 'open').length}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myJobs.filter(job => job.status === 'accepted' || job.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <Card.Content className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myJobs.filter(job => job.status === 'completed').length}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Jobs List */}
        {myJobs.length === 0 ? (
          <Card>
            <Card.Content className="p-12 text-center">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                Start by posting your first job to find skilled professionals.
              </p>
              <Link
                to="/post-job"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Post Your First Job
              </Link>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myJobs.map((job) => (
              <Card key={job._id}>
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {formatBudget(job)}
                    </div>
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {formatLocation(job.location)}
                    </div>
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      <button 
                        onClick={() => handleEditJob(job)}
                        disabled={job.status === 'in_progress' || job.status === 'completed'}
                        className="flex items-center text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={job.status === 'in_progress' || job.status === 'completed' ? 'Cannot edit jobs that are in progress or completed' : 'Edit job'}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job)}
                        disabled={deleteJobMutation.isLoading || job.status === 'in_progress' || job.status === 'completed'}
                        className="flex items-center text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={job.status === 'in_progress' || job.status === 'completed' ? 'Cannot delete jobs that are in progress or completed' : 'Delete job'}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {deleteJobMutation.isLoading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                    {job.assignedTo && (
                      <div className="text-sm text-secondary-600 dark:text-secondary-400">
                        Assigned to {job.assignedTo.firstName} {job.assignedTo.lastName}
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {showEditForm && editingJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-secondary-200/20 dark:border-secondary-700/20">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Edit Job
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">
                      {editingJob.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 flex items-center space-x-2 text-xs text-primary-100">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <span>Editing job details</span>
                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                <span>Review changes</span>
                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                <span>Save updates</span>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <JobForm
                job={editingJob}
                onSubmit={handleUpdateJob}
                onCancel={handleCancelEdit}
                loading={updateJobMutation.isLoading}
              />
            </div>
            
            {/* Enhanced Footer */}
            <div className="bg-secondary-50 dark:bg-secondary-900/50 p-4 border-t border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400">
                <div className="flex items-center space-x-4">
                  <span>Last updated: {new Date(editingJob.updatedAt || editingJob.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editingJob.status)}`}>
                    {editingJob.status.toUpperCase()}
                  </span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">Job ID: {editingJob._id.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
