// Dashboard Layout - LifeCherry
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlinePlusCircle, 
  HiOutlineBookOpen, 
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineFlag,
  HiOutlineDocumentText
} from 'react-icons/hi2';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Dummy user for UI development (will be replaced with real auth)
  // Currently logged in as Admin for development
  const dummyUser = {
    name: 'Omar Faruk',
    email: 'omar@example.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isPremium: true,
    role: 'admin' // 'user' or 'admin' - Set to 'admin' for Admin access
  };

  const isAdmin = dummyUser.role === 'admin';

  // User menu items
  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome, end: true },
    { name: 'Add Lesson', path: '/dashboard/add-lesson', icon: HiOutlinePlusCircle },
    { name: 'My Lessons', path: '/dashboard/my-lessons', icon: HiOutlineBookOpen },
    { name: 'My Favorites', path: '/dashboard/my-favorites', icon: HiOutlineHeart },
    { name: 'Profile', path: '/dashboard/profile', icon: HiOutlineUser },
  ];

  // Admin menu items
  const adminMenuItems = [
    { name: 'Admin Dashboard', path: '/dashboard/admin', icon: HiOutlineCog6Tooth, end: true },
    { name: 'Manage Users', path: '/dashboard/admin/manage-users', icon: HiOutlineUsers },
    { name: 'Manage Lessons', path: '/dashboard/admin/manage-lessons', icon: HiOutlineDocumentText },
    { name: 'Reported Lessons', path: '/dashboard/admin/reported-lessons', icon: HiOutlineFlag },
    { name: 'Admin Profile', path: '/dashboard/admin/profile', icon: HiOutlineUser },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
          isActive
            ? 'bg-cherry text-white shadow-lg shadow-cherry/20'
            : 'text-text-secondary hover:bg-cherry-50 hover:text-cherry'
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      <span className="font-medium">{item.name}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-white border-r border-border
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-5 border-b border-border flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍒</span>
            <span className="text-lg font-bold text-text">LifeCherry</span>
          </NavLink>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={dummyUser.photoURL} 
              alt={dummyUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-cherry-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text truncate text-sm">{dummyUser.name}</h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {isAdmin ? (
                  <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    🛡️ Admin
                  </span>
                ) : dummyUser.isPremium ? (
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                    ⭐ Premium
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                    Starter
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Back to Home - Always visible at bottom */}
        <div className="p-3 border-t border-border bg-white flex-shrink-0">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-cherry-50 hover:text-cherry transition-all duration-200 text-sm"
          >
            <HiOutlineHome className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content - Add left margin on desktop to account for fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden bg-white border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiOutlineBars3 className="w-6 h-6 text-text" />
          </button>
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍒</span>
            <span className="text-lg font-bold text-text">LifeCherry</span>
          </NavLink>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
