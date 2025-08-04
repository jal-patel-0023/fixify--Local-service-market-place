import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  FileText, 
  Clock, 
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Modal } from '../UI/Modal';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import JobScheduler from './JobScheduler';
import JobTemplate from './JobTemplate';
import LocationPicker from '../Map/LocationPicker';

const EnhancedJobForm = ({ onSuccess, initialData = {} }) => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    budget: initialData.budget || '',
    requirements: initialData.requirements || '',
    location: initialData.location || '',
    images: initialData.images || []
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => api.jobs.create(data),
    onSuccess: () => {
      toast.success('Job created successfully');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job');
    }
  });

  const handleUseTemplate = (template) => {
    setFormData({
      title: template.name,
      description: template.description,
      category: template.category,
      budget: template.budget,
      requirements: template.requirements,
      location: template.location,
      images: []
    });
    setSelectedTemplate(template);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const handleSchedule = (schedule) => {
    setScheduleData(schedule);
    setShowScheduler(false);
    toast.success('Job scheduled successfully');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      schedule: scheduleData,
      templateId: selectedTemplate?._id
    };

    createJobMutation.mutate(jobData);
  };

  const isFormValid = () => {
    return formData.title && formData.description && formData.category && formData.budget;
  };

  const getScheduleSummary = () => {
    if (!scheduleData) return 'Not scheduled';
    
    if (scheduleData.scheduleType === 'once') {
      return `${scheduleData.scheduledDate} at ${scheduleData.scheduledTime}`;
    } else if (scheduleData.scheduleType === 'recurring') {
      return `Recurring - ${scheduleData.recurringType}`;
    }
    return 'ASAP';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Enhanced Job
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Post a new job with advanced scheduling and template options
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Use Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowScheduler(true)}
            className="flex items-center gap-2"
          >
            <Calendar size={16} />
            Schedule
          </Button>
        </div>
      </div>

      {/* Template Summary */}
      {selectedTemplate && (
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <FileText size={16} />
              Applied Template
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Remove
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Schedule Summary */}
      {scheduleData && (
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Clock size={16} />
              Schedule
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {scheduleData.scheduleType === 'once' ? 'One-time' : 
                   scheduleData.scheduleType === 'recurring' ? 'Recurring' : 'ASAP'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getScheduleSummary()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleData(null)}
              >
                Remove
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Job Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>Job Details</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., House Cleaning Service"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the job requirements..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="painting">Painting</option>
                    <option value="moving">Moving</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget *
                  </label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="List any specific requirements or preferences..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <LocationPicker
                  value={formData.location}
                  onChange={(location) => setFormData(prev => ({ ...prev, location }))}
                />
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!isFormValid() || createJobMutation.isLoading}
            className="flex-1"
          >
            {createJobMutation.isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating Job...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Create Job
              </>
            )}
          </Button>
        </div>

        {/* Validation Warning */}
        {!isFormValid() && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <AlertCircle size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Please fill in all required fields to create the job.
            </span>
          </div>
        )}
      </form>

      {/* Scheduler Modal */}
      <Modal
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        title="Schedule Job"
        size="lg"
      >
        <JobScheduler
          onSchedule={handleSchedule}
          initialData={scheduleData}
        />
      </Modal>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Job Templates"
        size="xl"
      >
        <JobTemplate onUseTemplate={handleUseTemplate} />
      </Modal>
    </div>
  );
};

export default EnhancedJobForm; 