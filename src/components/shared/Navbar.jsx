// Navbar Component - LifeCherry
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from 'react-icons/hi2';
import { FiChevronDown, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { firebaseUser, userProfile, authLoading, authInitialized, profileLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Theme modes configuration
  const themeModes = [
    { id: 'light', icon: HiOutlineSun, label: 'Light Mode' },
    { id: 'system', icon: HiOutlineComputerDesktop, label: 'System' },
    { id: 'dark', icon: HiOutlineMoon, label: 'Dark Mode' }
  ];

  // Get current theme icon based on theme setting
  const getCurrentThemeIcon = () => {
    const currentMode = themeModes.find(m => m.id === theme) || themeModes[0];
    return currentMode.icon;
  };

  // Cycle through themes
  const cycleTheme = () => {
    const currentIndex = themeModes.findIndex(m => m.id === theme);
    const nextIndex = (currentIndex + 1) % themeModes.length;
    setTheme(themeModes[nextIndex].id);
  };

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Hide navbar when scrolling down
        setIsVisible(false);
        setIsDropdownOpen(false); // Close dropdown when hiding
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const providerPhotoURL = firebaseUser?.photoURL || firebaseUser?.providerData?.find((p) => p?.photoURL)?.photoURL;

  const authReady = authInitialized ? !authLoading && authInitialized : !authLoading;

  const user = firebaseUser
    ? {
      name: userProfile?.name || firebaseUser.displayName || 'User',
      email: firebaseUser.email,
      photoURL: userProfile?.photoURL || providerPhotoURL,
      isPremium: !!userProfile?.isPremium || userProfile?.role === 'admin',
      role: userProfile?.role || 'user',
    }
    : null;

  const avatarFallback = user
    ? `https://ui-avatars.com/api/?background=FEE2E2&color=9F1239&name=${encodeURIComponent(user?.name || 'User')}`
    : '';
  const avatarUrl = user?.photoURL || avatarFallback;

  const handleLogout = () => {
    toast.custom((t) => (
      <div className='bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 max-w-sm w-full animate-in fade-in slide-in-from-top-5 duration-300'>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cherry-50 dark:bg-cherry-900/20 rounded-xl text-cherry dark:text-cherry-300 flex-shrink-0">
            <FiLogOut className="w-6 h-6" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className='font-semibold text-gray-900 dark:text-white text-base'>Sign Out?</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Are you sure you want to end your current session?</p>
          </div>
        </div>
        <div className='flex gap-3 justify-end mt-2'>
          <button
            onClick={() => toast.dismiss(t.id)}
            className='px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await logout();
                toast.success('Logged out');
                setIsDropdownOpen(false);
                setIsMenuOpen(false);
                navigate('/');
              } catch (error) {
                toast.error(error.message || 'Failed to log out');
              }
            }}
            className='px-4 py-2 text-sm font-medium bg-cherry text-white rounded-lg hover:bg-cherry-700 shadow-lg shadow-cherry/20 transition-colors'
          >
            Logout
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/public-lessons', label: 'Public Lessons' },
  ];

  const privateLinks = [
    { path: '/dashboard/add-lesson', label: 'Add Lesson' },
    { path: '/dashboard/my-lessons', label: 'My Lessons' },
  ];

  const activeClass = "text-cherry font-semibold";
  const inactiveClass = "text-text-primary dark:text-gray-300 hover:text-cherry transition-colors";

  return (
    <nav className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-border dark:border-gray-800 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍒</span>
            <span className="text-xl font-bold text-text-primary dark:text-white">LifeCherry</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                {link.label}
              </NavLink>
            ))}

            {authReady && user && privateLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                {link.label}
              </NavLink>
            ))}

            {!authReady && (
              <div className="flex items-center gap-3">
                <div className="h-3 w-20 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-3 w-24 rounded-full bg-gray-100 animate-pulse" />
              </div>
            )}

            {/* Pricing - show for all logged-in users */}
            {authReady && user && (
              <NavLink
                to="/pricing"
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                Pricing
              </NavLink>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <div className="relative group">
              <button
                onClick={cycleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-cherry-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label={`Current theme: ${theme}. Click to change.`}
              >
                {theme === 'light' && <HiOutlineSun className="w-5 h-5 text-amber-500" />}
                {theme === 'dark' && <HiOutlineMoon className="w-5 h-5 text-cherry" />}
                {theme === 'system' && <HiOutlineComputerDesktop className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              </button>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {theme === 'light' && 'Light Mode'}
                {theme === 'dark' && 'Dark Mode'}
                {theme === 'system' && 'System'}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700" />
              </div>
            </div>

            {!authReady ? (
              <div className="flex items-center gap-3" aria-label="Loading user">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-border animate-pulse" />
                <div className="space-y-2">
                  <div className="h-2.5 w-20 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-2 w-16 bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-cherry-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = avatarFallback;
                    }}
                    className="w-8 h-8 rounded-full object-cover border-2 border-cherry-200"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-text-primary dark:text-white leading-tight">{user.name.split(' ')[0]}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${user.role === 'admin'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : user.isPremium
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                        : 'bg-gradient-to-r from-cherry to-cherry-dark text-white'
                      }`}>
                      {user.role === 'admin' ? 'Admin' : user.isPremium ? 'Premium' : 'Starter'}
                    </span>
                  </div>
                  <FiChevronDown className={`text-text-secondary dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-border dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-border dark:border-gray-700">
                      <p className="font-semibold text-text-primary dark:text-white">{user.name}</p>
                      <p className="text-sm text-text-muted dark:text-gray-400">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-700 hover:text-cherry transition-colors"
                    >
                      <FiUser size={18} />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-700 hover:text-cherry transition-colors"
                    >
                      <FiGrid size={18} />
                      <span>Dashboard</span>
                    </Link>

                    <hr className="my-2 border-border dark:border-gray-700" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-cherry hover:bg-cherry-50 dark:hover:bg-cherry-900/20 transition-colors w-full"
                    >
                      <FiLogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost-capsule text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-capsule text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cherry-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? (
              <HiX className="w-6 h-6 text-text-primary dark:text-white" />
            ) : (
              <HiMenu className="w-6 h-6 text-text-primary dark:text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border dark:border-gray-700">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg ${isActive ? 'bg-cherry-50 dark:bg-cherry/10 text-cherry font-semibold' : 'text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-800'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user && privateLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg ${isActive ? 'bg-cherry-50 dark:bg-cherry/10 text-cherry font-semibold' : 'text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-800'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user && (
                <NavLink
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg ${isActive ? 'bg-cherry-50 dark:bg-cherry/10 text-cherry font-semibold' : 'text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-800'}`
                  }
                >
                  Pricing
                </NavLink>
              )}

              <hr className="my-2 border-border dark:border-gray-700" />

              {/* Mobile Theme Toggle */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary dark:text-white">Appearance</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  {themeModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTheme(mode.id)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${theme === mode.id
                        ? 'bg-white dark:bg-gray-700 text-cherry dark:text-white shadow-sm'
                        : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-200'
                        }`}
                    >
                      <mode.icon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="my-2 border-border dark:border-gray-700" />

              {!authReady ? (
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-border animate-pulse" aria-label="Loading user" />
                  <div className="space-y-1">
                    <div className="h-2.5 w-24 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-2 w-16 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = avatarFallback;
                      }}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cherry-200"
                    />
                    <div>
                      <p className="font-semibold text-text-primary dark:text-white">{user.name}</p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${user.role === 'admin'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : user.isPremium
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                          : 'bg-gradient-to-r from-cherry to-cherry-dark text-white'
                        }`}>
                        {user.role === 'admin' ? 'Admin' : user.isPremium ? 'Premium' : 'Starter'}
                      </span>
                    </div>
                  </div>

                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Profile
                  </NavLink>

                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-text-secondary dark:text-gray-300 hover:bg-cherry-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Dashboard
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-cherry hover:bg-cherry-50 dark:hover:bg-cherry-900/20 rounded-lg text-left w-full"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-ghost-capsule text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-capsule text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
