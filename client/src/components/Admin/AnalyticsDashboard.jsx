import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Star, 
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { EmptyState } from '../UI/EmptyState';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin', 'analytics', timeRange],
    queryFn: () => api.admin.getAnalytics({ timeRange }),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (growth < 0) return <TrendingUp size={16} className="text-red-600 rotate-180" />;
    return <Activity size={16} className="text-gray-600" />;
  };

  const MetricCard = ({ title, value, change, icon, color = 'blue' }) => (
    <Card>
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(value)}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(change)}
                <span className={`text-sm font-medium ${getGrowthColor(change)}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            {icon}
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  const ChartCard = ({ title, children, className = '' }) => (
    <Card className={className}>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  );

  const SimpleBarChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 dark:text-gray-400 truncate">
              {item.label}
            </div>
            <div className="flex-1">
              <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded">
                <div
                  className="h-6 bg-blue-500 rounded transition-all duration-300"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 dark:text-white text-right">
              {formatNumber(item.value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PieChartComponent = ({ data, height = 200 }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No data available
        </div>
      );
    }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber(item.value)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage(item.value, total)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.response?.data?.message || 'Failed to load analytics data'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Platform performance and user activity insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={analytics.totalUsers}
              change={analytics.userGrowth}
              icon={<Users size={24} className="text-blue-600" />}
              color="blue"
            />
            <MetricCard
              title="Total Jobs"
              value={analytics.totalJobs}
              change={analytics.jobGrowth}
              icon={<Briefcase size={24} className="text-green-600" />}
              color="green"
            />
            <MetricCard
              title="Completed Jobs"
              value={analytics.completedJobs}
              change={analytics.completionGrowth}
              icon={<Star size={24} className="text-yellow-600" />}
              color="yellow"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${formatNumber(analytics.totalRevenue)}`}
              change={analytics.revenueGrowth}
              icon={<DollarSign size={24} className="text-purple-600" />}
              color="purple"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Categories Distribution */}
            <ChartCard title="Job Categories Distribution">
              <PieChartComponent data={analytics.jobCategories} />
            </ChartCard>

            {/* User Growth Trend */}
            <ChartCard title="User Growth Trend">
              <SimpleBarChart data={analytics.userGrowthTrend} />
            </ChartCard>

            {/* Job Status Distribution */}
            <ChartCard title="Job Status Distribution">
              <PieChartComponent data={analytics.jobStatus} />
            </ChartCard>

            {/* Revenue Trend */}
            <ChartCard title="Revenue Trend">
              <SimpleBarChart data={analytics.revenueTrend} />
            </ChartCard>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing Categories */}
            <ChartCard title="Top Performing Categories">
              <div className="space-y-3">
                {analytics.topCategories?.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(category.jobs)}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Recent Activity */}
            <ChartCard title="Recent Activity">
              <div className="space-y-3">
                {analytics.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Geographic Distribution */}
            <ChartCard title="Geographic Distribution">
              <div className="space-y-3">
                {analytics.geographicData?.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {location.city}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(location.jobs)}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Platform Performance">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average Response Time
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.avgResponseTime}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Job Completion Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.completionRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    User Satisfaction
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.userSatisfaction}/5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Users
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(analytics.activeUsers)}
                  </span>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Revenue Analytics">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average Job Value
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${formatNumber(analytics.avgJobValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Platform Fee Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.platformFeeRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Monthly Recurring Revenue
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${formatNumber(analytics.mrr)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Customer Lifetime Value
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${formatNumber(analytics.clv)}
                  </span>
                </div>
              </div>
            </ChartCard>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No Analytics Data"
          description="Analytics data is not available for the selected time range."
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard; 