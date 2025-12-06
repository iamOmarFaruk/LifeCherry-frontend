// Dashboard Home Page - LifeCherry Dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineBookOpen,
  HiOutlineHeart,
  HiOutlinePlusCircle,
  HiOutlineEye,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineCalendarDays,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineBookmark,
  HiOutlineStar
} from 'react-icons/hi2';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { lessons } from '../../data/lessons';
import { getFavoritesByUser } from '../../data/favorites';

const DashboardHome = () => {
  useDocumentTitle('Dashboard');
  
  // Dummy user for UI development
  const dummyUser = {
    name: 'Omar Faruk',
    email: 'omar@example.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isPremium: true
  };

  // Get user's lessons (using all lessons as demo)
  const userLessons = lessons.slice(0, 8); // Simulating user's own lessons
  const userFavorites = getFavoritesByUser('sarah@example.com'); // Using sample data
  
  // Stats
  const totalLessons = userLessons.length;
  const totalFavorites = userFavorites.length;
  const totalLikes = userLessons.reduce((acc, lesson) => acc + lesson.likesCount, 0);
  const totalViews = userLessons.reduce((acc, _, index) => acc + (500 + index * 123), 0);
  
  // Get recently added lessons (last 4)
  const recentLessons = [...userLessons]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Weekly activity data (mock data for chart)
  const weeklyData = [
    { day: 'Mon', lessons: 2, views: 45 },
    { day: 'Tue', lessons: 1, views: 32 },
    { day: 'Wed', lessons: 3, views: 67 },
    { day: 'Thu', lessons: 0, views: 28 },
    { day: 'Fri', lessons: 2, views: 54 },
    { day: 'Sat', lessons: 4, views: 89 },
    { day: 'Sun', lessons: 1, views: 41 },
  ];

  const maxViews = Math.max(...weeklyData.map(d => d.views));

  return (
    <PageLoader>
      <div className="space-y-6 lg:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text">
              Welcome back, {dummyUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-text-secondary mt-1">
              Here's an overview of your life lessons journey
            </p>
          </div>
          <Link
            to="/dashboard/add-lesson"
            className="inline-flex items-center gap-2 bg-cherry text-white px-5 py-2.5 rounded-xl font-medium hover:bg-cherry-dark transition-colors shadow-lg shadow-cherry/20"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            Add New Lesson
          </Link>
        </div>

        {/* Stats Cards - Professional Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Total Lessons */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Total Lessons</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{totalLessons}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingUp className="w-4 h-4" />
                    12%
                  </span>
                  <span className="text-sm text-text-muted">vs last month</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-cherry-50 rounded-xl flex items-center justify-center group-hover:bg-cherry group-hover:scale-110 transition-all duration-300">
                <HiOutlineBookOpen className="w-5 h-5 text-cherry group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Total Favorites */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Saved Favorites</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{totalFavorites}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingUp className="w-4 h-4" />
                    8%
                  </span>
                  <span className="text-sm text-text-muted">vs last month</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <HiOutlineBookmark className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Total Likes */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Total Likes</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{totalLikes.toLocaleString()}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingUp className="w-4 h-4" />
                    24%
                  </span>
                  <span className="text-sm text-text-muted">vs last month</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:scale-110 transition-all duration-300">
                <HiOutlineHeart className="w-5 h-5 text-rose-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">Total Views</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">{totalViews.toLocaleString()}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <HiOutlineArrowTrendingDown className="w-4 h-4" />
                    5%
                  </span>
                  <span className="text-sm text-text-muted">vs last month</span>
                </div>
              </div>
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                <HiOutlineEye className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-text">Weekly Activity</h2>
                <p className="text-sm text-text-secondary">Your lesson engagement this week</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-cherry rounded-full"></span>
                  Views
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-cherry-200 rounded-full"></span>
                  Lessons
                </span>
              </div>
            </div>
            
            {/* Animated Bar & Line Chart */}
            <div className="relative h-48">
              {/* SVG Line Chart Overlay */}
              <svg 
                className="absolute inset-0 w-full h-40 z-10 pointer-events-none"
                viewBox="0 0 700 160"
                preserveAspectRatio="none"
              >
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E63946" />
                    <stop offset="100%" stopColor="#F4A3A8" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E63946" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#E63946" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Area Fill */}
                <path
                  d={`M 50 ${160 - (weeklyData[0].views / maxViews) * 130} 
                      C 100 ${160 - (weeklyData[0].views / maxViews) * 130}, 100 ${160 - (weeklyData[1].views / maxViews) * 130}, 150 ${160 - (weeklyData[1].views / maxViews) * 130}
                      C 200 ${160 - (weeklyData[1].views / maxViews) * 130}, 200 ${160 - (weeklyData[2].views / maxViews) * 130}, 250 ${160 - (weeklyData[2].views / maxViews) * 130}
                      C 300 ${160 - (weeklyData[2].views / maxViews) * 130}, 300 ${160 - (weeklyData[3].views / maxViews) * 130}, 350 ${160 - (weeklyData[3].views / maxViews) * 130}
                      C 400 ${160 - (weeklyData[3].views / maxViews) * 130}, 400 ${160 - (weeklyData[4].views / maxViews) * 130}, 450 ${160 - (weeklyData[4].views / maxViews) * 130}
                      C 500 ${160 - (weeklyData[4].views / maxViews) * 130}, 500 ${160 - (weeklyData[5].views / maxViews) * 130}, 550 ${160 - (weeklyData[5].views / maxViews) * 130}
                      C 600 ${160 - (weeklyData[5].views / maxViews) * 130}, 600 ${160 - (weeklyData[6].views / maxViews) * 130}, 650 ${160 - (weeklyData[6].views / maxViews) * 130}
                      L 650 160 L 50 160 Z`}
                  fill="url(#areaGradient)"
                  className="animate-fade-in"
                />
                
                {/* Smooth Line */}
                <path
                  d={`M 50 ${160 - (weeklyData[0].views / maxViews) * 130} 
                      C 100 ${160 - (weeklyData[0].views / maxViews) * 130}, 100 ${160 - (weeklyData[1].views / maxViews) * 130}, 150 ${160 - (weeklyData[1].views / maxViews) * 130}
                      C 200 ${160 - (weeklyData[1].views / maxViews) * 130}, 200 ${160 - (weeklyData[2].views / maxViews) * 130}, 250 ${160 - (weeklyData[2].views / maxViews) * 130}
                      C 300 ${160 - (weeklyData[2].views / maxViews) * 130}, 300 ${160 - (weeklyData[3].views / maxViews) * 130}, 350 ${160 - (weeklyData[3].views / maxViews) * 130}
                      C 400 ${160 - (weeklyData[3].views / maxViews) * 130}, 400 ${160 - (weeklyData[4].views / maxViews) * 130}, 450 ${160 - (weeklyData[4].views / maxViews) * 130}
                      C 500 ${160 - (weeklyData[4].views / maxViews) * 130}, 500 ${160 - (weeklyData[5].views / maxViews) * 130}, 550 ${160 - (weeklyData[5].views / maxViews) * 130}
                      C 600 ${160 - (weeklyData[5].views / maxViews) * 130}, 600 ${160 - (weeklyData[6].views / maxViews) * 130}, 650 ${160 - (weeklyData[6].views / maxViews) * 130}`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="animate-draw-line"
                  style={{
                    strokeDasharray: 1000,
                    strokeDashoffset: 0,
                    animation: 'drawLine 1.5s ease-out forwards'
                  }}
                />
                
                {/* Data Points */}
                {weeklyData.map((data, index) => (
                  <g key={index}>
                    <circle
                      cx={50 + index * 100}
                      cy={160 - (data.views / maxViews) * 130}
                      r="6"
                      fill="white"
                      stroke="#E63946"
                      strokeWidth="3"
                      className="animate-pop-in"
                      style={{ 
                        animationDelay: `${0.2 + index * 0.1}s`,
                        opacity: 0,
                        animation: `popIn 0.3s ease-out ${0.2 + index * 0.1}s forwards`
                      }}
                    />
                    {/* Tooltip on hover */}
                    <title>{data.views} views</title>
                  </g>
                ))}
              </svg>

              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-40 relative z-0">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1 h-32 justify-end">
                      {/* Animated Bar */}
                      <div 
                        className="w-full max-w-10 bg-gradient-to-t from-cherry-100 to-cherry-50 rounded-t-xl transition-all duration-700 hover:from-cherry-200 hover:to-cherry-100 cursor-pointer relative group"
                        style={{ 
                          height: `${(data.views / maxViews) * 100}%`,
                          animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                        }}
                      >
                        {/* Hover tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.views} views
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted font-medium">{data.day}</span>
                  </div>
                ))}
              </div>
              
              {/* Lessons mini bars (secondary data) */}
              <div className="flex items-end justify-between gap-2 h-8 absolute bottom-6 left-0 right-0 px-1">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex-1 flex justify-center">
                    <div 
                      className="w-2 bg-cherry-200 rounded-full transition-all duration-500"
                      style={{ 
                        height: `${Math.max((data.lessons / 4) * 100, 10)}%`,
                        animation: `growUp 0.6s ease-out ${0.5 + index * 0.08}s both`
                      }}
                      title={`${data.lessons} lessons`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Summary */}
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-text">356</p>
                <p className="text-xs text-text-secondary">Total Views</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-text">13</p>
                <p className="text-xs text-text-secondary">New Lessons</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-cherry">+23%</p>
                <p className="text-xs text-text-secondary">vs Last Week</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard/add-lesson"
                className="flex items-center gap-3 p-3 rounded-xl bg-cherry-50 hover:bg-cherry-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-cherry rounded-lg flex items-center justify-center">
                  <HiOutlinePlusCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">Add New Lesson</p>
                  <p className="text-xs text-text-secondary">Share your wisdom</p>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-cherry opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                to="/dashboard/my-lessons"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <HiOutlineBookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">Manage Lessons</p>
                  <p className="text-xs text-text-secondary">Edit or update</p>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                to="/dashboard/my-favorites"
                className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <HiOutlineHeart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">View Favorites</p>
                  <p className="text-xs text-text-secondary">Saved lessons</p>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                to="/public-lessons"
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <HiOutlineSparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">Explore Lessons</p>
                  <p className="text-xs text-text-secondary">Discover wisdom</p>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recently Added Lessons */}
        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text">Recently Added Lessons</h2>
              <p className="text-sm text-text-secondary">Your latest contributions</p>
            </div>
            <Link
              to="/dashboard/my-lessons"
              className="text-cherry text-sm font-medium hover:underline flex items-center gap-1"
            >
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentLessons.map((lesson) => (
              <div 
                key={lesson._id} 
                className="group bg-bg rounded-xl p-4 hover:shadow-md transition-all border border-transparent hover:border-cherry-100"
              >
                <div className="relative mb-3">
                  <img
                    src={lesson.image}
                    alt={lesson.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {lesson.accessLevel === 'premium' && (
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <HiOutlineStar className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-cherry-50 text-cherry text-[10px] font-medium rounded-full">
                    {lesson.category}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-text-secondary text-[10px] font-medium rounded-full">
                    {lesson.emotionalTone}
                  </span>
                </div>
                <h3 className="font-semibold text-text text-sm mb-2 line-clamp-2 group-hover:text-cherry transition-colors">
                  {lesson.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                    {formatDate(lesson.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <HiOutlineHeart className="w-3.5 h-3.5" />
                      {lesson.likesCount}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <HiOutlineBookmark className="w-3.5 h-3.5" />
                      {lesson.favoritesCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Upgrade Banner (for free users) */}
        {!dummyUser.isPremium && (
          <div className="bg-gradient-to-r from-cherry to-cherry-dark rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-xl lg:text-2xl font-bold mb-2">Upgrade to Premium ⭐</h3>
                <p className="text-white/80 text-sm lg:text-base">
                  Unlock premium lessons, create premium content, and get featured in the community.
                </p>
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white text-cherry px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shrink-0"
              >
                <HiOutlineSparkles className="w-5 h-5" />
                View Pricing
              </Link>
            </div>
          </div>
        )}

        {/* Monthly Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Most Popular Lesson */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <h3 className="font-bold text-text">Top Performing</h3>
            </div>
            {userLessons[0] && (
              <div>
                <p className="font-medium text-text text-sm line-clamp-2 mb-2">
                  {userLessons[0].title}
                </p>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <HiOutlineHeart className="w-3.5 h-3.5 text-red-400" />
                    {userLessons[0].likesCount} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineBookmark className="w-3.5 h-3.5 text-blue-400" />
                    {userLessons[0].favoritesCount} saves
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <HiOutlineChartBar className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-text">Top Categories</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Personal Growth</span>
                <span className="text-sm font-medium text-text">35%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-cherry rounded-full h-2" style={{ width: '35%' }}></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-text-secondary">Mindset</span>
                <span className="text-sm font-medium text-text">28%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-cherry-300 rounded-full h-2" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>

          {/* This Month Stats */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <HiOutlineCalendarDays className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-text">This Month</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Lessons Created</span>
                <span className="text-sm font-bold text-text">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">New Likes</span>
                <span className="text-sm font-bold text-green-600">+127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">New Followers</span>
                <span className="text-sm font-bold text-green-600">+23</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default DashboardHome;
