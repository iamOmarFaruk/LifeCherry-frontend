// Payment Cancel Page - LifeCherry
import React from 'react';
import { Link } from 'react-router-dom';
import { FiXCircle, FiArrowLeft, FiHelpCircle, FiRefreshCw } from 'react-icons/fi';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PaymentCancel = () => {
  useDocumentTitle('Payment Cancelled');

  return (
    <PageLoader>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Cancel Card */}
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
            {/* Cancel Icon */}
            <div className="w-24 h-24 bg-cherry-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-14 h-14 text-cherry" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Payment Cancelled
            </h1>
            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              Your payment was cancelled. Don't worry, you haven't been charged. Your free account is still active.
            </p>

            {/* Reasons Section */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FiHelpCircle className="w-5 h-5" />
                Common reasons for cancellation:
              </h3>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-cherry">•</span>
                  <span>Changed your mind - That's okay! Take your time to decide.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cherry">•</span>
                  <span>Payment issue - Try again with a different payment method.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cherry">•</span>
                  <span>Have questions - Check our FAQ or contact support.</span>
                </li>
              </ul>
            </div>

            {/* Still Interested Section */}
            <div className="bg-cherry-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-text-primary mb-2">Still interested in Premium?</h3>
              <p className="text-text-secondary text-sm mb-4">
                Unlock unlimited lessons, premium content access, and more with our one-time payment of ৳1,500.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 text-cherry font-medium hover:underline"
              >
                <FiRefreshCw className="w-4 h-4" />
                View Pricing Again
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/pricing"
                className="btn-capsule inline-flex items-center gap-2 px-8 py-3"
              >
                <FiRefreshCw className="w-5 h-5" />
                Try Again
              </Link>
              <Link
                to="/"
                className="btn-ghost-capsule inline-flex items-center gap-2 px-8 py-3"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center text-text-muted text-sm">
            <p>
              Having trouble with payment?{' '}
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

export default PaymentCancel;
