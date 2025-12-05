// Navbar Component - LifeCherry
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiChevronDown, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';

// Dummy user for testing (will be replaced with auth context)
const dummyUser = {
  name: "Sarah Johnson",
  email: "sarah@example.com",
  photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  isPremium: true
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // TODO: Replace with actual auth state
  const user = dummyUser; // Set to null to test logged-out state

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/public-lessons', label: 'Public Lessons' },
  ];

  const privateLinks = [
    { path: '/dashboard/add-lesson', label: 'Add Lesson' },
    { path: '/dashboard/my-lessons', label: 'My Lessons' },
  ];

  const activeClass = "text-cherry font-semibold";
  const inactiveClass = "text-text-secondary hover:text-cherry transition-colors";

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍒</span>
            <span className="text-xl font-bold text-cherry">LifeCherry</span>
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
            
            {user && privateLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                {link.label}
              </NavLink>
            ))}

            {user && !user.isPremium && (
              <NavLink
                to="/pricing"
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                Pricing
              </NavLink>
            )}

            {user && user.isPremium && (
              <span className="badge-premium flex items-center gap-1">
                ⭐ Premium
              </span>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="btn-ghost-capsule text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-capsule text-sm">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-cherry-50 transition-colors"
                >
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-cherry-200"
                  />
                  <FiChevronDown className={`text-text-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      <p className="text-sm text-text-muted">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-cherry-50 hover:text-cherry transition-colors"
                    >
                      <FiUser size={18} />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-cherry-50 hover:text-cherry transition-colors"
                    >
                      <FiGrid size={18} />
                      <span>Dashboard</span>
                    </Link>
                    
                    <hr className="my-2 border-border" />
                    
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        // TODO: Implement logout
                        console.log('Logout clicked');
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors w-full"
                    >
                      <FiLogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cherry-50 transition-colors"
          >
            {isMenuOpen ? (
              <HiX className="w-6 h-6 text-text-primary" />
            ) : (
              <HiMenu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg ${isActive ? 'bg-cherry-50 text-cherry font-semibold' : 'text-text-secondary hover:bg-cherry-50'}`
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
                    `px-4 py-2.5 rounded-lg ${isActive ? 'bg-cherry-50 text-cherry font-semibold' : 'text-text-secondary hover:bg-cherry-50'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user && !user.isPremium && (
                <NavLink
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg ${isActive ? 'bg-cherry-50 text-cherry font-semibold' : 'text-text-secondary hover:bg-cherry-50'}`
                  }
                >
                  Pricing
                </NavLink>
              )}

              <hr className="my-2 border-border" />

              {!user ? (
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
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cherry-200"
                    />
                    <div>
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      {user.isPremium && (
                        <span className="badge-premium text-xs">⭐ Premium</span>
                      )}
                    </div>
                  </div>
                  
                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-text-secondary hover:bg-cherry-50 rounded-lg"
                  >
                    Profile
                  </NavLink>
                  
                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-text-secondary hover:bg-cherry-50 rounded-lg"
                  >
                    Dashboard
                  </NavLink>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      console.log('Logout clicked');
                    }}
                    className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-left"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
