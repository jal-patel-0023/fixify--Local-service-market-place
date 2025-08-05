import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { api } from '../../services/api';

const NotificationToast = () => {
  // Fetch unread notifications
  const { data: notifications } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => api.auth.getNotifications({ unread: true, limit: 10 }),
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 10 * 1000 // 10 seconds
  });

  const getNotificationIcon = (type, priority) => {
    if (priority === 'high') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (type === 'urgent') return <AlertCircle className="h-5 w-5 text-orange-500" />;
    if (type === 'job') return <Bell className="h-5 w-5 text-blue-500" />;
    if (type === 'message') return <Bell className="h-5 w-5 text-green-500" />;
    if (type === 'review') return <Bell className="h-5 w-5 text-yellow-500" />;
    return <Info className="h-5 w-5 text-gray-500" />;
  };

  const getNotificationStyle = (type, priority) => {
    if (priority === 'high') return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20';
    if (type === 'urgent') return 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
    return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
  };

  useEffect(() => {
    if (notifications?.length > 0) {
      notifications.forEach((notification) => {
        // Only show toast for high priority or urgent notifications
        if (notification.priority === 'high' || notification.type === 'urgent') {
          toast.custom(
            (t) => (
              <div className={`${getNotificationStyle(notification.type, notification.priority)} p-4 rounded-lg shadow-lg max-w-sm w-full`}>
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type, notification.priority)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: 'top-right'
            }
          );
        }
      });
    }
  }, [notifications]);

  return null; // This component doesn't render anything visible
};

export default NotificationToast; 