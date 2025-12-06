// Register Page - LifeCherry
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiImage, FiCheck, FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useMutation } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  useDocumentTitle('Create Account');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const { register, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photoURL: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (payload) => register(payload),
    onSuccess: () => {
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  const googleMutation = useMutation({
    mutationFn: () => loginWithGoogle(),
    onSuccess: () => {
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || 'Google sign-in failed');
    },
  });

  const handleGoogleLogin = () => {
    googleMutation.mutate();
  };

  // Password validation
  const password = formData.password;
  const validations = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasMinLength: password.length >= 6
  };
  const isPasswordValid = validations.hasUppercase && validations.hasLowercase && validations.hasMinLength;

  return (
    <PageLoader>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cherry-50 via-white to-cherry-100">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">🍒</span>
            <span className="text-2xl font-bold text-text-primary">LifeCherry</span>
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary">Start sharing your life lessons today</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-6"
          >
            <FcGoogle size={24} />
            <span className="font-medium text-text-primary">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-muted">or register with email</span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-text-muted" size={20} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-text-muted" size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Photo URL Input */}
            <div>
              <label htmlFor="photoURL" className="block text-sm font-medium text-text-primary mb-2">
                Photo URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiImage className="text-text-muted" size={20} />
                </div>
                <input
                  type="url"
                  id="photoURL"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleChange}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-text-muted" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className={`flex items-center gap-2 text-sm ${validations.hasUppercase ? 'text-green-600' : 'text-text-muted'}`}>
                    {validations.hasUppercase ? <FiCheck size={16} /> : <FiX size={16} />}
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${validations.hasLowercase ? 'text-green-600' : 'text-text-muted'}`}>
                    {validations.hasLowercase ? <FiCheck size={16} /> : <FiX size={16} />}
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${validations.hasMinLength ? 'text-green-600' : 'text-text-muted'}`}>
                    {validations.hasMinLength ? <FiCheck size={16} /> : <FiX size={16} />}
                    <span>Minimum 6 characters</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending || !isPasswordValid}
              className="w-full btn-capsule py-3 text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-cherry font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-text-muted">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-cherry hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-cherry hover:underline">Privacy Policy</Link>
        </p>
      </div>
      </div>
    </PageLoader>
  );
};

export default Register;
