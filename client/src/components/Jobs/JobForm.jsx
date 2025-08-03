import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, DollarSign, Calendar, Clock } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import LocationPicker from '../Map/LocationPicker';
import { jobCategories } from '../../utils/config';

const JobForm = ({
  job = null,
  onSubmit,
  onCancel,
  loading = false,
  className = '',
  ...props
}) => {
  const [selectedCategory, setSelectedCategory] = useState(job?.category || '');
  const [budgetType, setBudgetType] = useState(job?.budget?.type || 'fixed');
  const [selectedLocation, setSelectedLocation] = useState(
    job?.location?.coordinates ? {
      lat: job.location.coordinates[1],
      lng: job.location.coordinates[0],
      address: job.location.address?.formatted
    } : null
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      category: job?.category || '',
      budgetType: job?.budget?.type || 'fixed',
      budgetMin: job?.budget?.min || '',
      budgetMax: job?.budget?.max || '',
      location: job?.location?.address?.formatted || '',
      preferredDate: job?.preferredDate ? new Date(job.preferredDate).toISOString().split('T')[0] : '',
      preferredTime: job?.preferredTime || '',
      requirements: job?.requirements?.join(', ') || '',
    },
  });
  
  const onSubmitForm = (data) => {
    const formData = {
      ...data,
      category: selectedCategory,
      budget: {
        type: budgetType,
        min: parseInt(data.budgetMin) || 0,
        max: parseInt(data.budgetMax) || 0,
      },
      location: selectedLocation ? {
        coordinates: [selectedLocation.lng, selectedLocation.lat],
        address: {
          formatted: selectedLocation.address || `${selectedLocation.lat}, ${selectedLocation.lng}`,
        },
      } : null,
      requirements: data.requirements ? data.requirements.split(',').map(r => r.trim()) : [],
    };
    
    onSubmit?.(formData);
  };
  
  return (
    <Card className={className} {...props}>
      <Card.Header>
        <Card.Title>
          {job ? 'Edit Job' : 'Post a New Job'}
        </Card.Title>
        <Card.Description>
          Fill in the details below to {job ? 'update' : 'create'} your job posting.
        </Card.Description>
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Title */}
          <Input
            label="Job Title"
            placeholder="e.g., Need a plumber for bathroom repair"
            {...register('title', {
              required: 'Job title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
              maxLength: { value: 100, message: 'Title must be less than 100 characters' },
            })}
            error={errors.title?.message}
            required
          />
          
          {/* Description */}
          <div>
            <label className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2 block">
              Description
            </label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 20, message: 'Description must be at least 20 characters' },
                maxLength: { value: 2000, message: 'Description must be less than 2000 characters' },
              })}
              rows={6}
              className="w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              placeholder="Describe the job in detail..."
            />
            {errors.description && (
              <p className="text-sm text-error-600 mt-1">{errors.description.message}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2 block">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {jobCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-3 rounded-md border text-sm transition-colors ${
                    selectedCategory === category.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
            {!selectedCategory && (
              <p className="text-sm text-error-600 mt-1">Please select a category</p>
            )}
          </div>
          
          {/* Budget */}
          <div>
            <label className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2 block">
              Budget
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBudgetType('fixed')}
                  className={`px-3 py-2 rounded border text-sm ${
                    budgetType === 'fixed'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200'
                  }`}
                >
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('range')}
                  className={`px-3 py-2 rounded border text-sm ${
                    budgetType === 'range'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200'
                  }`}
                >
                  Price Range
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min amount"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  {...register('budgetMin', {
                    required: 'Minimum budget is required',
                    min: { value: 1, message: 'Minimum budget must be at least $1' },
                  })}
                  error={errors.budgetMin?.message}
                />
                {budgetType === 'range' && (
                  <Input
                    type="number"
                    placeholder="Max amount"
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    {...register('budgetMax', {
                      required: 'Maximum budget is required for range',
                      min: { value: 1, message: 'Maximum budget must be at least $1' },
                    })}
                    error={errors.budgetMax?.message}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div>
            <label className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2 block">
              Location *
            </label>
            <LocationPicker
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Enter address or click on map"
            />
            {!selectedLocation && (
              <p className="text-sm text-error-600 mt-1">Please select a location</p>
            )}
          </div>
          
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preferred Date"
              type="date"
              leftIcon={<Calendar className="h-4 w-4" />}
              {...register('preferredDate')}
            />
            <Input
              label="Preferred Time"
              type="time"
              leftIcon={<Clock className="h-4 w-4" />}
              {...register('preferredTime')}
            />
          </div>
          
          {/* Requirements */}
          <Input
            label="Requirements (optional)"
            placeholder="e.g., Licensed, 2+ years experience, Own tools"
            {...register('requirements')}
          />
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!selectedCategory || !selectedLocation}
              className="flex-1"
            >
              {job ? 'Update Job' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};

export default JobForm; 