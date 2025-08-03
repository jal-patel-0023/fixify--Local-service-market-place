import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, User, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import { jobCategories, jobStatusOptions } from '../../utils/config';

const JobCard = ({
  job,
  onSave,
  onAccept,
  showActions = true,
  className = '',
  ...props
}) => {
  const {
    _id,
    title,
    description,
    category,
    budget,
    location,
    preferredDate,
    preferredTime,
    status,
    creator,
    stats,
    createdAt,
    isSaved = false,
  } = job;
  
  const categoryInfo = jobCategories.find(cat => cat.value === category);
  const statusInfo = jobStatusOptions.find(s => s.value === status);
  
  const formatBudget = (budget) => {
    if (budget.min === budget.max) {
      return `$${budget.min}`;
    }
    return `$${budget.min} - $${budget.max}`;
  };
  
  const formatDate = (date) => {
    if (!date) return 'Flexible';
    return format(new Date(date), 'MMM dd, yyyy');
  };
  
  const formatTime = (time) => {
    if (!time) return 'Flexible';
    return time;
  };
  
  const getLocationText = () => {
    if (!location?.address) return 'Location not specified';
    return location.address.city || location.address.state || 'Location available';
  };
  
  return (
    <Card className={`hover:shadow-medium transition-shadow duration-200 ${className}`} {...props}>
      <Card.Header>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{categoryInfo?.icon}</span>
              <Badge variant="secondary" size="sm">
                {categoryInfo?.label || category}
              </Badge>
              {statusInfo && (
                <Badge variant={statusInfo.color} size="sm">
                  {statusInfo.label}
                </Badge>
              )}
            </div>
            
            <Link to={`/jobs/${_id}`} className="block group">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2 line-clamp-2">
              {description}
            </p>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onSave?.(_id)}
                className="p-2 text-secondary-400 hover:text-primary-600 transition-colors"
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-3">
          {/* Budget */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-success-600" />
            <span className="font-medium text-secondary-900 dark:text-secondary-100">
              {formatBudget(budget)}
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-secondary-500" />
            <span className="text-secondary-600 dark:text-secondary-400">
              {getLocationText()}
            </span>
          </div>
          
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-secondary-500" />
            <span className="text-secondary-600 dark:text-secondary-400">
              {formatDate(preferredDate)} at {formatTime(preferredTime)}
            </span>
          </div>
          
          {/* Creator */}
          {creator && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-secondary-500" />
              <span className="text-secondary-600 dark:text-secondary-400">
                Posted by {creator.fullName || creator.firstName || 'Anonymous'}
              </span>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-secondary-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{stats?.views || 0} views</span>
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </Card.Content>
      
      {showActions && status === 'open' && (
        <Card.Footer>
          <div className="flex items-center justify-between w-full">
            <Link to={`/jobs/${_id}`} className="flex-1">
              <Button variant="outline" size="sm" fullWidth>
                View Details
              </Button>
            </Link>
            
            {onAccept && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAccept(_id)}
                className="ml-3"
              >
                Accept Job
              </Button>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default JobCard; 