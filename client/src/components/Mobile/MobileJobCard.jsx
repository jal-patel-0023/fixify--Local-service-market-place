import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';

const MobileJobCard = ({ job, onSave, onShare }) => {
  const navigate = useNavigate();

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(budget);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'success',
      accepted: 'warning',
      in_progress: 'info',
      completed: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const handleCardPress = () => {
    navigate(`/jobs/${job._id}`);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave?.(job._id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: job.description,
        url: `${window.location.origin}/jobs/${job._id}`
      });
    } else {
      onShare?.(job);
    }
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    navigate(`/messages?job=${job._id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow touch-manipulation"
      onClick={handleCardPress}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {job.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          <Badge variant={getStatusColor(job.status)} size="sm">
            {job.status}
          </Badge>
          {job.urgency === 'urgent' && (
            <Badge variant="error" size="sm">
              Urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Budget and Location */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              {formatBudget(job.budget)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {job.location?.address || 'Location not specified'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {formatTimeAgo(job.createdAt)}
          </span>
        </div>
      </div>

      {/* Creator Info */}
      {job.creator && (
        <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              {job.creator.avatar ? (
                <img 
                  src={job.creator.avatar} 
                  alt={job.creator.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {job.creator.firstName?.[0]}{job.creator.lastName?.[0]}
                </span>
              )}
            </div>
            
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {job.creator.firstName} {job.creator.lastName}
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {job.creator.rating?.average?.toFixed(1) || 'New'}
                </span>
                {job.creator.verified && (
                  <Badge variant="success" size="xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {job.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
          {job.tags.length > 3 && (
            <Badge variant="outline" size="sm">
              +{job.tags.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleMessage}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Message</span>
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-1"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>

      {/* Quick Actions for Mobile */}
      <div className="flex gap-2 mt-3 sm:hidden">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/${job._id}/apply`);
          }}
          className="flex-1"
          size="sm"
        >
          Apply Now
        </Button>
        
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/${job._id}`);
          }}
          size="sm"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default MobileJobCard; 