// Payment Success Page - LifeCherry
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiStar, FiArrowRight, FiBookOpen, FiUnlock, FiAward } from 'react-icons/fi';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PaymentSuccess = () => {
  useDocumentTitle('Payment Successful');

  useEffect(() => {
    // TODO: Verify payment with backend and update user premium status
    // This would typically call an API to verify the Stripe session
  }, []);

  return (
    <PageLoader>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
            {/* Success Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <FiCheckCircle className="w-14 h-14 text-success" />
              </div>
              {/* Confetti effect */}
              <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</span>
              <span className="absolute -top-1 -left-3 text-2xl animate-bounce delay-75">✨</span>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Payment Successful!
            </h1>
            <p className="text-text-secondary text-lg mb-6">
              Welcome to the Premium family! Your account has been upgraded successfully.
            </p>

            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-md mb-8">
              <FiStar className="w-5 h-5" />
              <span>You're Now Premium!</span>
            </div>

            {/* What You Unlocked */}
            <div className="bg-cherry-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-text-primary mb-4">What you've unlocked:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Unlimited lessons</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Premium content access</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Create premium lessons</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Priority listing</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Premium badge</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="btn-capsule inline-flex items-center gap-2 px-8 py-3"
              >
                Go to Dashboard
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/public-lessons"
                className="btn-ghost-capsule inline-flex items-center gap-2 px-8 py-3"
              >
                <FiBookOpen className="w-5 h-5" />
                Explore Lessons
              </Link>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="mt-6 text-center text-text-muted text-sm">
            <p>A receipt has been sent to your email address.</p>
            <p className="mt-1">
              Need help?{' '}
              <Link to="/contact" className="text-cherry hover:underline">
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
