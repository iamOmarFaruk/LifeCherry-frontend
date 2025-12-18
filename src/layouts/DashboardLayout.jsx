// Dashboard Layout - LifeCherry
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, userProfile, authLoading, authInitialized, profileLoading, viewMode, toggleViewMode, logout } = useAuth();

  // Redirect unauthenticated users away from dashboard
  useEffect(() => {
    if (authInitialized && !authLoading && !firebaseUser) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [authInitialized, authLoading, firebaseUser, navigate, location.pathname]);

  const providerPhotoURL = useMemo(() => {
    return firebaseUser?.photoURL || firebaseUser?.providerData?.find((p) => p?.photoURL)?.photoURL;
  }, [firebaseUser]);

  const user = firebaseUser
    ? {
      name: userProfile?.name || firebaseUser.displayName || 'User',
      email: firebaseUser.email,
      photoURL: userProfile?.photoURL || providerPhotoURL,
      isPremium: !!userProfile?.isPremium || userProfile?.role === 'admin',
      role: userProfile?.role || 'user',
    }
    : null;

  const isLoading = authLoading || profileLoading || !authInitialized;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    toast.custom((t) => (
      <div className='bg-surface dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-border dark:border-gray-700 flex flex-col gap-3 max-w-sm w-full animate-in fade-in slide-in-from-top-5 duration-300 ring-1 ring-black/5'>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cherry-50 dark:bg-cherry-900/20 rounded-xl text-cherry dark:text-cherry-300 flex-shrink-0">
            <HiOutlineArrowRightOnRectangle className="w-6 h-6" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className='font-semibold text-text dark:text-gray-100 text-base'>Sign Out?</h3>
            <p className='text-sm text-text-secondary dark:text-gray-400 mt-1 leading-relaxed'>Are you sure you want to end your current session?</p>
          </div>
        </div>
        <div className='flex gap-3 justify-end mt-2 pl-14'>
          <button
            onClick={() => toast.dismiss(t.id)}
            className='px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await logout();
                toast.success('Logged out successfully');
                navigate('/');
              } catch (error) {
                console.error('Logout error:', error);
                toast.error('Failed to logout');
              }
            }}
            className='px-4 py-2 text-sm font-medium bg-cherry text-white rounded-lg hover:bg-cherry-700 shadow-lg shadow-cherry/20 hover:shadow-cherry/30 transform active:scale-95 transition-all'
          >
            Logout
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  // User menu items
  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome, end: true },
    { name: 'Add Lesson', path: '/dashboard/add-lesson', icon: HiOutlinePlusCircle },
    { name: 'My Lessons', path: '/dashboard/my-lessons', icon: HiOutlineBookOpen },
    { name: 'My Favorites', path: '/dashboard/my-favorites', icon: HiOutlineHeart },
    { name: 'My Reports', path: '/dashboard/my-reports', icon: HiOutlineFlag },
    { name: 'My Activity', path: '/dashboard/activity', icon: HiOutlineDocumentText },
    { name: 'Profile', path: '/dashboard/profile', icon: HiOutlineUser },
  ];

  // Admin menu items
  const adminMenuItems = [
    { name: 'Admin Dashboard', path: '/dashboard/admin', icon: HiOutlineCog6Tooth, end: true },
    { name: 'Change History', path: '/dashboard/admin/activity', icon: HiOutlineDocumentText },
    { name: 'Manage Users', path: '/dashboard/admin/manage-users', icon: HiOutlineUsers },
    { name: 'Manage Lessons', path: '/dashboard/admin/manage-lessons', icon: HiOutlineDocumentText },
    { name: 'Reported Lessons', path: '/dashboard/admin/reported-lessons', icon: HiOutlineFlag },
    { name: 'Trash Management', path: '/dashboard/admin/trash', icon: HiOutlineTrash },
    { name: 'Admin Profile', path: '/dashboard/admin/profile', icon: HiOutlineUser },
  ];

  const menuItems = isAdmin
    ? (viewMode === 'admin' ? adminMenuItems : userMenuItems)
    : userMenuItems;

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${isActive
          ? 'bg-cherry text-white shadow-lg shadow-cherry/20'
          : 'text-text-secondary dark:text-gray-400 hover:bg-cherry hover:text-white hover:shadow-lg hover:shadow-cherry/20'
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
        w-64 bg-surface border-r border-border
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-4 border-b border-border dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍒</span>
            <span className="text-lg font-bold text-text">LifeCherry</span>
          </NavLink>
          {/* Close button for mobile sidebar */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border dark:border-gray-700 flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-border animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-24 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-2 w-20 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(user.name || 'User')}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-cherry-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate text-sm">{user.name}</h3>
                <p className="text-[11px] text-text-muted dark:text-gray-400 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {isAdmin ? (
                    <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                      🛡️ Admin
                    </span>
                  ) : user.isPremium ? (
                    <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                      ⭐ Premium
                    </span>
                  ) : (
                    <span className="text-[10px] bg-gradient-to-r from-cherry to-cherry-dark text-white px-1.5 py-0.5 rounded-full font-medium">
                      Starter
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-sm text-text-secondary dark:text-gray-400">
              <p>Redirecting to login…</p>
            </div>
          )}
        </div>

        {/* Admin View Toggle */}
        {isAdmin && (
          <div className="px-3 py-2 border-b border-border dark:border-gray-700">
            <button
              onClick={toggleViewMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-text-secondary dark:text-gray-400 bg-transparent dark:bg-transparent hover:text-text dark:hover:text-white transition-all border border-transparent hover:border-border dark:hover:border-gray-700"
            >
              <span>View as {viewMode === 'admin' ? 'User' : 'Admin'}</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${viewMode === 'admin' ? 'bg-cherry' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm transition-transform ${viewMode === 'admin' ? 'left-4.5 bg-white' : 'left-0.5 bg-white dark:bg-cherry'}`} style={{ left: viewMode === 'admin' ? '18px' : '2px' }} />
              </div>
            </button>
          </div>
        )}

        {/* Navigation - Scrollable area */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          <div className="pt-2 mt-2 border-t border-border dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-cherry-50 hover:text-cherry dark:hover:bg-cherry-900/20 dark:hover:text-cherry-300 transition-all duration-200 text-sm group"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>



        {/* Back to Home - Always visible at bottom */}
        <div className="p-3 border-t border-border bg-surface flex-shrink-0">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-cherry hover:text-white hover:shadow-lg hover:shadow-cherry/20 transition-all duration-200 text-sm"
          >
            <HiOutlineHome className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content - Add left margin on desktop to account for fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineBars3 className="w-6 h-6 text-text dark:text-white" />
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
