// Admin Dashboard Home - LifeCherry Admin
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineFlag,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineReceiptPercent,
  HiOutlineArchiveBox,
  HiOutlinePencilSquare
} from 'react-icons/hi2';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import apiClient from '../../../utils/apiClient';
import useAuth from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminDashboardHome = () => {
  useDocumentTitle('Admin Dashboard');
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalLessons: 0,
    newLessonsThisMonth: 0,
    publicLessons: 0,
    privateLessons: 0,
    premiumLessons: 0,
    totalReports: 0,
    pendingReports: 0,
    todaysLessons: 0,
    premiumUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [weeklyUserData, setWeeklyUserData] = useState([]);
  const [weeklyLessonData, setWeeklyLessonData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          adminStatsRes,
          lessonsStatsRes,
          auditRes,
        ] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/lessons/stats'),
          apiClient.get('/audit/admin?limit=5'),
        ]);

        const adminStats = adminStatsRes.data;
        const lessonsData = lessonsStatsRes.data;
        const auditData = auditRes.data;

        setStats({
          totalUsers: adminStats.summary.totalUsers,
          newUsersThisMonth: adminStats.weeklyStats.reduce((sum, day) => sum + day.users, 0), // Last 7 days total for "this month" placeholder
          totalLessons: adminStats.summary.totalLessons,
          newLessonsThisMonth: adminStats.weeklyStats.reduce((sum, day) => sum + day.lessons, 0),
          publicLessons: lessonsData.public,
          privateLessons: lessonsData.private,
          premiumLessons: adminStats.summary.premiumUsers,
          totalReports: adminStats.summary.totalReports,
          pendingReports: lessonsData.flagged || 0,
          todaysLessons: adminStats.weeklyStats[adminStats.weeklyStats.length - 1]?.lessons || 0,
          premiumUsers: adminStats.summary.premiumUsers
        });

        // Map weekly stats for charts
        setWeeklyUserData(adminStats.weeklyStats.map(d => ({ day: d.day, users: d.users })));
        setWeeklyLessonData(adminStats.weeklyStats.map(d => ({ day: d.day, lessons: d.lessons })));
        setRevenueData(adminStats.revenueTrend);

        // Map audit logs to activities
        const mappedActivities = auditData.changes.map(log => ({
          id: log.id,
          type: log.targetType,
          action: log.summary,
          name: log.actorName || log.actorEmail,
          time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: getIconForType(log.targetType)
        }));
        setRecentActivities(mappedActivities);

        // Mock users for contributors until we have a real "top contributors" endpoint
        const usersRes = await apiClient.get('/users?limit=5');
        setTopContributors(usersRes.data.users.map(u => ({
          ...u,
          lessonsCount: 0
        })));

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getIconForType = (type) => {
    switch (type) {
      case 'user': return HiOutlineUsers;
      case 'lesson': return HiOutlineBookOpen;
      case 'report': return HiOutlineFlag;
      default: return HiOutlineSparkles;
    }
  };

  // Derived Financial Stats
  const premiumPrice = 1500;
  const totalRevenue = stats.premiumUsers * premiumPrice;
  const conversionRate = stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0;
  const averageRevenuePerUser = stats.totalUsers > 0 ? Math.floor(totalRevenue / stats.totalUsers) : 0;

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1000);
  const maxUsers = Math.max(...weeklyUserData.map(d => d.users), 1);
  const maxLessons = Math.max(...weeklyLessonData.map(d => d.lessons), 1);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <HiOutlineShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-text-secondary dark:text-gray-400">
            Welcome back, {userProfile?.name}! Here's your platform overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary dark:text-gray-400 flex items-center gap-1">
            <HiOutlineClock className="w-4 h-4" />
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Total Users</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-text dark:text-white tracking-tight">{stats.totalUsers}</h3>
              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <HiOutlineArrowTrendingUp className="w-4 h-4" />
                  +12
                </span>
                <span className="text-sm text-text-muted dark:text-gray-400">this month</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
              <HiOutlineUsers className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Total Lessons</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-text dark:text-white tracking-tight">{stats.totalLessons}</h3>
              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <HiOutlineArrowTrendingUp className="w-4 h-4" />
                  +8
                </span>
                <span className="text-sm text-text-muted dark:text-gray-400">this month</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-cherry-50 dark:bg-cherry-900/20 rounded-xl flex items-center justify-center group-hover:bg-cherry group-hover:scale-110 transition-all duration-300">
              <HiOutlineBookOpen className="w-5 h-5 text-cherry-dark dark:text-cherry-300 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Reported Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Pending Reports</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-text dark:text-white tracking-tight">{stats.pendingReports}</h3>
              <div className="flex items-center gap-2 mt-3">
                <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${stats.pendingReports > 0
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'}`}>
                  <HiOutlineFlag className="w-4 h-4" />
                  {stats.pendingReports > 0 ? 'Needs review' : 'All clear'}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
              <HiOutlineFlag className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Today's Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted dark:text-gray-400 mb-1">Today's Lessons</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-text dark:text-white tracking-tight">{stats.todaysLessons}</h3>
              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <HiOutlineArrowTrendingUp className="w-4 h-4" />
                  Active
                </span>
              </div>
            </div>
            <div className="w-11 h-11 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
              <HiOutlineCalendarDays className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Subscription Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-border dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <HiOutlineBanknotes className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text dark:text-white">Revenue & Subscriptions</h2>
            <p className="text-text-secondary dark:text-gray-400 text-sm">Financial overview and subscription metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineBanknotes className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-text-secondary dark:text-gray-400">Total Revenue</p>
            </div>
            <h3 className="text-3xl font-bold text-text dark:text-white mb-2">৳{totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-text-muted dark:text-gray-400">Projected all-time</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineCalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-text-secondary dark:text-gray-400">This Month</p>
            </div>
            <h3 className="text-3xl font-bold text-text dark:text-white mb-2">৳{(totalRevenue * 0.15).toFixed(0)}</h3>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
              <span>Est. 15% of total</span>
            </div>
          </div>

          {/* Premium Users */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineStar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-text-secondary dark:text-gray-400">Premium Users</p>
            </div>
            <h3 className="text-3xl font-bold text-text dark:text-white mb-2">{stats.premiumUsers}</h3>
            <p className="text-xs text-text-muted dark:text-gray-400">{conversionRate}% conversion rate</p>
          </div>

          {/* ARPU */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineReceiptPercent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-medium text-text-secondary dark:text-gray-400">Avg Revenue/User</p>
            </div>
            <h3 className="text-3xl font-bold text-text dark:text-white mb-2">৳{averageRevenuePerUser}</h3>
            <p className="text-xs text-text-muted dark:text-gray-400">Per user lifetime value</p>
          </div>
        </div>
      </div>

      {/* Charts Section - Revenue, User & Lesson Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text dark:text-white">Revenue Growth</h2>
              <p className="text-sm text-text-secondary dark:text-gray-400">Last 6 months revenue trend</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                Revenue
              </span>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-40">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1 h-32 justify-end">
                  <span className="text-xs font-medium text-text dark:text-white">৳{(data.revenue / 1000).toFixed(0)}k</span>
                  <div
                    className="w-full max-w-10 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-700 hover:from-emerald-600 hover:to-emerald-500 cursor-pointer relative group"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 100}%`,
                      animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.subscriptions} subs
                    </div>
                  </div>
                </div>
                <span className="text-xs text-text-muted dark:text-gray-400 font-medium">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text dark:text-white">User Growth</h2>
              <p className="text-sm text-text-secondary dark:text-gray-400">New registrations this week</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                Users
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-40">
            {weeklyUserData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1 h-32 justify-end">
                  <span className="text-xs font-medium text-text dark:text-white">{data.users}</span>
                  <div
                    className="w-full max-w-10 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-700 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                    style={{
                      height: `${(data.users / maxUsers) * 100}%`,
                      animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                    }}
                  />
                </div>
                <span className="text-xs text-text-muted dark:text-gray-400 font-medium">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text dark:text-white">Lesson Growth</h2>
              <p className="text-sm text-text-secondary dark:text-gray-400">New lessons this week</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-cherry rounded-full"></span>
                Lessons
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-40">
            {weeklyLessonData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1 h-32 justify-end">
                  <span className="text-xs font-medium text-text dark:text-white">{data.lessons}</span>
                  <div
                    className="w-full max-w-10 bg-gradient-to-t from-cherry to-cherry-400 rounded-t-lg transition-all duration-700 hover:from-cherry-dark hover:to-cherry cursor-pointer"
                    style={{
                      height: `${(data.lessons / maxLessons) * 100}%`,
                      animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                    }}
                  />
                </div>
                <span className="text-xs text-text-muted dark:text-gray-400 font-medium">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-text dark:text-white mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'lesson' ? 'bg-cherry-50 dark:bg-cherry-900/20' :
                      activity.type === 'report' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-purple-50 dark:bg-purple-900/30'
                    }`}>
                    <activity.icon className={`w-4 h-4 ${activity.type === 'user' ? 'text-blue-600 dark:text-blue-400' :
                      activity.type === 'lesson' ? 'text-cherry dark:text-cherry-300' :
                        activity.type === 'report' ? 'text-amber-600 dark:text-amber-400' :
                          'text-purple-600 dark:text-purple-400'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text dark:text-white">{activity.action}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400 truncate">{activity.name}</p>
                  </div>
                  <span className="text-xs text-text-muted dark:text-gray-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-secondary dark:text-gray-400">
                No recent activity found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 lg:p-6 border border-border dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-text dark:text-white mb-5">Content Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineEye className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-text dark:text-white">Public Lessons</span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.publicLessons}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-text dark:text-white">Private Lessons</span>
              </div>
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.privateLessons}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineFlag className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-medium text-text dark:text-white">Total Reports</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{stats.totalReports}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/admin/manage-users"
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <HiOutlineUsers className="w-6 h-6" />
            <span className="font-medium">Manage Users</span>
          </Link>
          <Link
            to="/dashboard/admin/manage-lessons"
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <HiOutlineBookOpen className="w-6 h-6" />
            <span className="font-medium">Manage Lessons</span>
          </Link>
          <Link
            to="/dashboard/admin/reported-lessons"
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <HiOutlineFlag className="w-6 h-6" />
            <span className="font-medium">View Reports</span>
          </Link>
          <Link
            to="/dashboard/admin/profile"
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <HiOutlineShieldCheck className="w-6 h-6" />
            <span className="font-medium">Admin Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
