// Payment Success Page - LifeCherry
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiStar, FiArrowRight, FiBookOpen, FiUnlock, FiAward } from 'react-icons/fi';
import apiClient from '../utils/apiClient';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuth from '../hooks/useAuth';

const PaymentSuccess = () => {
  useDocumentTitle('Payment Successful');
  const { profileRefetch } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) return;
      try {
        await apiClient.post('/payments/verify', { sessionId });
        // Trigger user profile refresh to update UI immediately
        await profileRefetch();
      } catch (error) {
        console.error('Verification failed', error);
      }
    };
    verify();
  }, [sessionId, profileRefetch]);

  return (
    <PageLoader>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 transition-colors duration-300">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 text-center border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            {/* Success Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <FiCheckCircle className="w-14 h-14 text-success" />
              </div>
              {/* Confetti effect */}
              <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</span>
              <span className="absolute -top-1 -left-3 text-2xl animate-bounce delay-75">✨</span>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-text-secondary dark:text-gray-300 text-lg mb-6">
              Welcome to the Premium family! Your account has been upgraded successfully.
            </p>

            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-md shadow-amber-500/20 mb-8">
              <FiStar className="w-5 h-5" />
              <span>You're Now Premium!</span>
            </div>

            {/* What You Unlocked */}
            <div className="bg-cherry-50 dark:bg-gray-700/30 rounded-2xl p-6 mb-8 border border-cherry-100 dark:border-gray-600/30">
              <h3 className="font-semibold text-text-primary dark:text-white mb-4">What you've unlocked:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-300">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Unlimited lessons</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-300">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Premium content access</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-300">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Create premium lessons</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-300">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-300">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Priority listing</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-300">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Premium badge</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="btn-capsule inline-flex items-center gap-2 px-8 py-3 bg-cherry hover:bg-cherry-dark text-white rounded-full transition-colors font-medium shadow-lg shadow-cherry/20"
              >
                Go to Dashboard
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/public-lessons"
                className="btn-ghost-capsule inline-flex items-center gap-2 px-8 py-3 text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-full transition-colors font-medium border border-gray-200 dark:border-gray-700"
              >
                <FiBookOpen className="w-5 h-5" />
                Explore Lessons
              </Link>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="mt-6 text-center text-text-muted dark:text-gray-400 text-sm">
            <p>A receipt has been sent to your email address.</p>
            <p className="mt-1">
              Need help?{' '}
              <Link to="/contact" className="text-cherry hover:underline font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default PaymentSuccess;

