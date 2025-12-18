// Login Page - LifeCherry
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useMutation } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import AnimatedCherry from '../components/shared/AnimatedCherry';

const Login = () => {
  useDocumentTitle('Login');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const { login, loginWithGoogle, firebaseUser, authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // If already authenticated, bounce away from login page
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, firebaseUser, navigate, redirectTo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const loginMutation = useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: () => {
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign in');
    },
  });

  const handleGoogleLogin = () => {
    googleMutation.mutate();
  };

  const googleMutation = useMutation({
    mutationFn: () => loginWithGoogle(),
    onSuccess: () => {
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || 'Google sign-in failed');
    },
  });

  return (
    <PageLoader>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cherry-50 via-white to-cherry-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-6 md:mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 md:mb-6">
              <AnimatedCherry className="text-3xl md:text-4xl" />
              <span className="text-xl md:text-2xl font-bold text-text-primary dark:text-white">LifeCherry</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-white mb-2">Welcome Back!</h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm md:text-base">Sign in to continue your learning journey</p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 mb-6"
            >
              <FcGoogle size={24} />
              <span className="font-medium text-text-primary dark:text-white">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-text-muted dark:text-gray-400">or sign in with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="text-text-muted dark:text-gray-400" size={20} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white dark:placeholder-gray-400 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-text-muted dark:text-gray-400" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white dark:placeholder-gray-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full btn-capsule py-3 text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-text-secondary dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cherry font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-sm text-text-muted dark:text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-cherry hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-cherry hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </PageLoader>
  );
};

export default Login;
