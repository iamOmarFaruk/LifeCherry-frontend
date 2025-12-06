// Admin Dashboard Home - LifeCherry Admin
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineFlag,
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineReceiptPercent
} from 'react-icons/hi2';
import PageLoader from '../../../components/shared/PageLoader';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { lessons } from '../../../data/lessons';
import { users } from '../../../data/users';
import { reports } from '../../../data/reports';

const AdminDashboardHome = () => {
  useDocumentTitle('Admin Dashboard');
  
  // Admin user info
  const adminUser = {
    name: 'Omar Faruk',
    email: 'omar@example.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'admin'
  };

  // Platform Stats
  const totalUsers = users.length;
  const totalLessons = lessons.length;
  const publicLessons = lessons.filter(l => l.visibility === 'public').length;
  const privateLessons = lessons.filter(l => l.visibility === 'private').length;
  const premiumLessons = lessons.filter(l => l.accessLevel === 'premium').length;
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const todaysLessons = lessons.filter(l => {
    const today = new Date();
    const lessonDate = new Date(l.createdAt);
    return lessonDate.toDateString() === today.toDateString();
  }).length || 3; // Fallback for demo
  
  // Subscription & Revenue Stats
  const premiumUsers = users.filter(u => u.isPremium).length;
  const conversionRate = ((premiumUsers / totalUsers) * 100).toFixed(1);
  const premiumPrice = 1500; // ৳1500 per subscription
  const totalRevenue = premiumUsers * premiumPrice;
  const monthlyRevenue = Math.floor(totalRevenue * 0.15); // Mock 15% came this month
  const averageRevenuePerUser = Math.floor(totalRevenue / totalUsers);
  
  // Revenue data for chart (last 6 months)
  const revenueData = [
    { month: 'Jul', revenue: 45000, subscriptions: 30 },
    { month: 'Aug', revenue: 52500, subscriptions: 35 },
    { month: 'Sep', revenue: 67500, subscriptions: 45 },
    { month: 'Oct', revenue: 75000, subscriptions: 50 },
    { month: 'Nov', revenue: 82500, subscriptions: 55 },
    { month: 'Dec', revenue: monthlyRevenue, subscriptions: premiumUsers },
  ];
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
  
  // Recent payments (mock data)
  const recentPayments = [
    { id: 1, userName: 'Alice Johnson', userEmail: 'alice@example.com', amount: 1500, status: 'completed', date: '2 mins ago', paymentMethod: 'Stripe' },
    { id: 2, userName: 'Bob Smith', userEmail: 'bob@example.com', amount: 1500, status: 'completed', date: '25 mins ago', paymentMethod: 'Stripe' },
    { id: 3, userName: 'Charlie Brown', userEmail: 'charlie@example.com', amount: 1500, status: 'completed', date: '1 hour ago', paymentMethod: 'Stripe' },
    { id: 4, userName: 'Diana Prince', userEmail: 'diana@example.com', amount: 1500, status: 'completed', date: '3 hours ago', paymentMethod: 'Stripe' },
    { id: 5, userName: 'Ethan Hunt', userEmail: 'ethan@example.com', amount: 1500, status: 'pending', date: '5 hours ago', paymentMethod: 'Stripe' },
  ];
  
  // Most active contributors (mock data based on lessons)
  const contributors = users
    .map(user => ({
      ...user,
      lessonsCount: lessons.filter(l => l.creatorEmail === user.email).length
    }))
    .sort((a, b) => b.lessonsCount - a.lessonsCount)
    .slice(0, 5);

  // Weekly data for charts
  const weeklyUserData = [
    { day: 'Mon', users: 12 },
    { day: 'Tue', users: 8 },
    { day: 'Wed', users: 15 },
    { day: 'Thu', users: 10 },
    { day: 'Fri', users: 18 },
    { day: 'Sat', users: 25 },
    { day: 'Sun', users: 14 },
  ];

  const weeklyLessonData = [
    { day: 'Mon', lessons: 5 },
    { day: 'Tue', lessons: 3 },
    { day: 'Wed', lessons: 8 },
    { day: 'Thu', lessons: 4 },
    { day: 'Fri', lessons: 12 },
    { day: 'Sat', lessons: 15 },
    { day: 'Sun', lessons: 7 },
  ];

  const maxUsers = Math.max(...weeklyUserData.map(d => d.users));
  const maxLessons = Math.max(...weeklyLessonData.map(d => d.lessons));

  // Recent activities (mock)
  const recentActivities = [
    { id: 1, type: 'user', action: 'New user registered', name: 'John Doe', time: '2 mins ago', icon: HiOutlineUsers },
    { id: 2, type: 'lesson', action: 'New lesson created', name: 'The Art of Patience', time: '15 mins ago', icon: HiOutlineBookOpen },
    { id: 3, type: 'report', action: 'Lesson reported', name: 'Suspicious Content', time: '32 mins ago', icon: HiOutlineFlag },
    { id: 4, type: 'premium', action: 'User upgraded to Premium', name: 'Sarah Johnson', time: '1 hour ago', icon: HiOutlineStar },
    { id: 5, type: 'lesson', action: 'Lesson marked as featured', name: 'Embracing Change', time: '2 hours ago', icon: HiOutlineSparkles },
  ];

  return (
    <PageLoader>
      <div className="space-y-6 lg:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiOutlineShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-text-secondary">
              Welcome back, {adminUser.name}! Here's your platform overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" />
              Last updated: Just now
            </span>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Total Users</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{totalUsers}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingUp className="w-4 h-4" />
                    18%
                  </span>
                  <span className="text-sm text-text-muted">this month</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                <HiOutlineUsers className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* Total Lessons */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Total Lessons</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{totalLessons}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingUp className="w-4 h-4" />
                    24%
                  </span>
                  <span className="text-sm text-text-muted">this month</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-cherry-50 rounded-xl flex items-center justify-center group-hover:bg-cherry group-hover:scale-110 transition-all duration-300">
                <HiOutlineBookOpen className="w-5 h-5 text-cherry-dark group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* Reported Lessons */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Pending Reports</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{pendingReports}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <HiOutlineFlag className="w-4 h-4" />
                    Needs review
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <HiOutlineFlag className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* Today's Lessons */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Today's Lessons</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{todaysLessons}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingUp className="w-4 h-4" />
                    Active
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
                <HiOutlineCalendarDays className="w-5 h-5 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Subscription Stats */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <HiOutlineBanknotes className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Revenue & Subscriptions</h2>
              <p className="text-text-secondary text-sm">Financial overview and subscription metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineBanknotes className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
              </div>
              <h3 className="text-3xl font-bold text-text mb-2">৳{totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-text-muted">All-time earnings</p>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineCalendarDays className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-text-secondary">This Month</p>
              </div>
              <h3 className="text-3xl font-bold text-text mb-2">৳{monthlyRevenue.toLocaleString()}</h3>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
                <span>23% vs last month</span>
              </div>
            </div>

            {/* Premium Users */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineStar className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-medium text-text-secondary">Premium Users</p>
              </div>
              <h3 className="text-3xl font-bold text-text mb-2">{premiumUsers}</h3>
              <p className="text-xs text-text-muted">{conversionRate}% conversion rate</p>
            </div>

            {/* ARPU */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineReceiptPercent className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-text-secondary">Avg Revenue/User</p>
              </div>
              <h3 className="text-3xl font-bold text-text mb-2">৳{averageRevenuePerUser}</h3>
              <p className="text-xs text-text-muted">Per user lifetime value</p>
            </div>
          </div>
        </div>

        {/* Charts Section - Revenue, User & Lesson Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-text">Revenue Growth</h2>
                <p className="text-sm text-text-secondary">Last 6 months revenue trend</p>
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
                    <span className="text-xs font-medium text-text">৳{(data.revenue / 1000).toFixed(0)}k</span>
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
                  <span className="text-xs text-text-muted font-medium">{data.month}</span>
                </div>
              ))}
            </div>

            {/* Chart Summary */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">৳{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-text-secondary">Total Revenue</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <HiOutlineArrowTrendingUp className="w-4 h-4" />
                +23% growth
              </span>
            </div>
          </div>
          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-text">User Growth</h2>
                <p className="text-sm text-text-secondary">New registrations this week</p>
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
                    <span className="text-xs font-medium text-text">{data.users}</span>
                    <div 
                      className="w-full max-w-10 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-700 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                      style={{ 
                        height: `${(data.users / maxUsers) * 100}%`,
                        animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-muted font-medium">{data.day}</span>
                </div>
              ))}
            </div>

            {/* Chart Summary */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-text">102</p>
                <p className="text-xs text-text-secondary">Total this week</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <HiOutlineArrowTrendingUp className="w-4 h-4" />
                +18% vs last week
              </span>
            </div>
          </div>

          {/* Lesson Growth Chart */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-text">Lesson Growth</h2>
                <p className="text-sm text-text-secondary">New lessons this week</p>
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
                    <span className="text-xs font-medium text-text">{data.lessons}</span>
                    <div 
                      className="w-full max-w-10 bg-gradient-to-t from-cherry to-cherry-400 rounded-t-lg transition-all duration-700 hover:from-cherry-dark hover:to-cherry cursor-pointer"
                      style={{ 
                        height: `${(data.lessons / maxLessons) * 100}%`,
                        animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-muted font-medium">{data.day}</span>
                </div>
              ))}
            </div>

            {/* Chart Summary */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-text">54</p>
                <p className="text-xs text-text-secondary">Total this week</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <HiOutlineArrowTrendingUp className="w-4 h-4" />
                +24% vs last week
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text">Recent Payments</h2>
              <span className="text-cherry text-sm font-medium">Last 24 hours</span>
            </div>
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      payment.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <HiOutlineCreditCard className={`w-5 h-5 ${
                        payment.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{payment.userName}</p>
                      <p className="text-xs text-text-secondary truncate">{payment.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-green-600">৳{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Total Today</span>
                <span className="font-bold text-text">৳{(recentPayments.filter(p => p.status === 'completed').length * 1500).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text">Top Contributors</h2>
              <Link to="/dashboard/admin/manage-users" className="text-cherry text-sm font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {contributors.map((user, index) => (
                <div key={user._id} className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={user.photoURL} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className={`absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                      index === 0 ? 'bg-amber-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text text-sm truncate">{user.name}</h4>
                    <p className="text-xs text-text-secondary">{user.lessonsCount} lessons</p>
                  </div>
                  {user.isPremium && (
                    <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                      ⭐ Premium
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text mb-5">Content Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <HiOutlineEye className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium text-text">Public Lessons</span>
                </div>
                <span className="text-lg font-bold text-green-600">{publicLessons}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <HiOutlineDocumentText className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-text">Private Lessons</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{privateLessons}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <HiOutlineStar className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-medium text-text">Premium Lessons</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{premiumLessons}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <HiOutlineFlag className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-medium text-text">Total Reports</span>
                </div>
                <span className="text-lg font-bold text-red-600">{totalReports}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text mb-5">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'lesson' ? 'bg-cherry-50' :
                    activity.type === 'report' ? 'bg-amber-100' :
                    'bg-purple-100'
                  }`}>
                    <activity.icon className={`w-4 h-4 ${
                      activity.type === 'user' ? 'text-blue-600' :
                      activity.type === 'lesson' ? 'text-cherry' :
                      activity.type === 'report' ? 'text-amber-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{activity.action}</p>
                    <p className="text-xs text-text-secondary truncate">{activity.name}</p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </PageLoader>
  );
};

export default AdminDashboardHome;
