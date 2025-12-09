// Pricing Page - LifeCherry
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiStar, FiZap, FiShield, FiAward, FiTrendingUp, FiUnlock, FiBookOpen, FiHeart, FiChevronDown } from 'react-icons/fi';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Pricing = () => {
  useDocumentTitle('Pricing - Upgrade to Premium');
  const navigate = useNavigate();
  const { firebaseUser, userProfile, authLoading, profileLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // FAQ data
  const faqs = [
    {
      question: 'Is this a one-time payment?',
      answer: 'Yes! Pay ৳1,500 once and get lifetime access to all premium features. No recurring fees, no hidden charges.'
    },
    {
      question: 'Can I cancel after upgrading?',
      answer: "Since it's a one-time payment with lifetime access, there's nothing to cancel. However, we offer a 7-day money-back guarantee if you're not satisfied."
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit/debit cards through Stripe. Your payment information is securely processed and never stored on our servers.'
    },
    {
      question: 'What happens to my existing lessons after upgrading?',
      answer: "All your existing lessons remain intact. You'll immediately gain the ability to create unlimited lessons and access all premium content."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const user = firebaseUser
    ? {
        name: userProfile?.name || firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        isPremium: !!userProfile?.isPremium || userProfile?.role === 'admin',
      }
    : null;

  const handleUpgrade = async () => {
    if (!firebaseUser) {
      navigate('/login', { state: { from: '/pricing' } });
      toast.error('Please sign in to upgrade');
      return;
    }
    setIsLoading(true);
    try {
      // TODO: Call backend /create-checkout-session and redirect to Stripe
      toast('Checkout integration coming soon');
    } catch (error) {
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  // Feature comparison data
  const features = [
    {
      feature: 'Create Life Lessons',
      free: 'Up to 10 lessons',
      premium: 'Unlimited lessons',
      freeIcon: true,
      premiumIcon: true
    },
    {
      feature: 'View Public Lessons',
      free: 'Free lessons only',
      premium: 'All lessons (Free + Premium)',
      freeIcon: true,
      premiumIcon: true
    },
    {
      feature: 'Create Premium Lessons',
      free: false,
      premium: 'Create exclusive content',
      freeIcon: false,
      premiumIcon: true
    },
    {
      feature: 'Ad-Free Experience',
      free: false,
      premium: 'No distractions',
      freeIcon: false,
      premiumIcon: true
    },
    {
      feature: 'Priority Listing',
      free: false,
      premium: 'Your lessons appear first',
      freeIcon: false,
      premiumIcon: true
    },
    {
      feature: 'Featured Creator Badge',
      free: false,
      premium: 'Stand out in the community',
      freeIcon: false,
      premiumIcon: true
    },
    {
      feature: 'Advanced Analytics',
      free: 'Basic stats only',
      premium: 'Detailed insights & trends',
      freeIcon: true,
      premiumIcon: true
    },
    {
      feature: 'Export Lessons as PDF',
      free: false,
      premium: 'Download your wisdom',
      freeIcon: false,
      premiumIcon: true
    }
  ];

  // Benefits cards data
  const benefits = [
    {
      icon: FiUnlock,
      title: 'Unlock Premium Content',
      description: 'Access exclusive lessons from top contributors and thought leaders.'
    },
    {
      icon: FiBookOpen,
      title: 'Unlimited Creation',
      description: 'Share as many life lessons as you want without any restrictions.'
    },
    {
      icon: FiTrendingUp,
      title: 'Priority Visibility',
      description: 'Your lessons get featured prominently in search results.'
    },
    {
      icon: FiAward,
      title: 'Premium Badge',
      description: 'Show your commitment to wisdom sharing with an exclusive badge.'
    }
  ];

  // If user is already premium, show different UI
  if (authLoading || profileLoading) {
    return <PageLoader />;
  }

  if (user?.isPremium) {
    return (
      <PageLoader>
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg mb-8">
              <FiStar className="w-6 h-6" />
              <span>Premium Member</span>
            </div>

            {/* Success Message */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-4">
                You're a Premium Member! ⭐
              </h1>
              <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
                Thank you for being a premium member. You have access to all features and exclusive content.
              </p>

              {/* Premium Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-cherry-50 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary">Unlimited lessons</span>
                </div>
                <div className="bg-cherry-50 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary">Premium content access</span>
                </div>
                <div className="bg-cherry-50 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary">Priority listing</span>
                </div>
                <div className="bg-cherry-50 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary">Ad-free experience</span>
                </div>
              </div>

              <Link
                to="/dashboard"
                className="btn-capsule inline-flex items-center gap-2 px-8 py-3"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100">
        {/* Header Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-cherry-100 text-cherry px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiZap className="w-4 h-4" />
              Upgrade Your Experience
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Unlock Premium Features
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Get unlimited access to all lessons, create premium content, and join our exclusive community of wisdom seekers.
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan Card */}
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 relative">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Free Plan</h3>
                  <p className="text-text-secondary text-sm">Perfect for getting started</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-text-primary">৳0</span>
                  <span className="text-text-muted ml-2">forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary">Up to 10 lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary">View free public lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary">Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary">Save to favorites</span>
                  </li>
                  <li className="flex items-center gap-3 text-text-muted">
                    <FiX className="w-5 h-5 flex-shrink-0" />
                    <span>Premium content access</span>
                  </li>
                  <li className="flex items-center gap-3 text-text-muted">
                    <FiX className="w-5 h-5 flex-shrink-0" />
                    <span>Create premium lessons</span>
                  </li>
                </ul>
                <button
                  disabled
                  className="w-full py-3 rounded-full border-2 border-gray-200 text-text-muted font-medium cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>

              {/* Premium Plan Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-cherry relative overflow-hidden">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-cherry to-cherry-dark text-white px-6 py-2 text-sm font-semibold transform rotate-0 origin-top-right rounded-bl-xl">
                    <span className="flex items-center gap-1">
                      <FiStar className="w-4 h-4" /> Most Popular
                    </span>
                  </div>
                </div>

                <div className="mb-6 mt-4">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Premium Plan</h3>
                  <p className="text-text-secondary text-sm">For serious wisdom seekers</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-cherry">৳1,500</span>
                  <span className="text-text-muted ml-2">one-time payment</span>
                  <p className="text-sm text-success font-medium mt-1">Lifetime access!</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary font-medium">Unlimited lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary font-medium">All lessons (Free + Premium)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary font-medium">Create premium lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary font-medium">Ad-free experience</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary font-medium">Priority listing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary font-medium">Premium creator badge</span>
                  </li>
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full btn-capsule py-3 text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiZap className="w-5 h-5" />
                      Upgrade to Premium
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">Compare Plans</h2>
              <p className="text-text-secondary">See what's included in each plan</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-cherry-50">
                <div className="p-4 font-semibold text-text-primary">Feature</div>
                <div className="p-4 font-semibold text-text-primary text-center">Free</div>
                <div className="p-4 font-semibold text-cherry text-center flex items-center justify-center gap-2">
                  <FiStar className="w-4 h-4" /> Premium
                </div>
              </div>

              {/* Table Body */}
              {features.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t border-gray-100`}
                >
                  <div className="p-4 text-text-primary font-medium">{item.feature}</div>
                  <div className="p-4 text-center flex items-center justify-center">
                    {item.freeIcon ? (
                      <div className="flex flex-col items-center">
                        <FiCheck className="w-5 h-5 text-success" />
                        {typeof item.free === 'string' && (
                          <span className="text-xs text-text-muted mt-1">{item.free}</span>
                        )}
                      </div>
                    ) : (
                      <FiX className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  <div className="p-4 text-center flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <FiCheck className="w-5 h-5 text-success" />
                      {typeof item.premium === 'string' && (
                        <span className="text-xs text-cherry mt-1">{item.premium}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-cherry-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">Why Go Premium?</h2>
              <p className="text-text-secondary">Unlock the full potential of LifeCherry</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="w-14 h-14 bg-cherry-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-cherry" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{benefit.title}</h3>
                  <p className="text-text-secondary text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiShield className="w-6 h-6 text-success" />
              <span className="text-lg font-semibold text-text-primary">Secure Payment</span>
            </div>
            <p className="text-text-secondary mb-8">
              Your payment is processed securely through Stripe. We never store your card details.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-text-muted">
                <FiShield className="w-5 h-5" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <FiCheck className="w-5 h-5" />
                <span className="text-sm">Money-back Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <FiHeart className="w-5 h-5" />
                <span className="text-sm">Lifetime Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-cherry-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer transition-colors ${
                      openFaq === index ? 'bg-cherry-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold text-text-primary text-[15px]">{faq.question}</h3>
                    <FiChevronDown
                      className={`w-5 h-5 text-cherry flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-4 pt-0 border-t border-gray-100">
                      <p className="text-text-secondary text-sm leading-relaxed pt-3">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20 relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(230, 57, 70, 0.92), rgba(198, 47, 59, 0.92)), url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80')`
          }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Ready to Unlock Your Potential?
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Join thousands of premium members who are making the most of their wisdom journey.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-white text-cherry font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-70 cursor-pointer"
            >
              <FiZap className="w-5 h-5" />
              Upgrade to Premium - ৳1,500
            </button>
            <p className="text-white/70 text-sm mt-4">One-time payment • Lifetime access</p>
          </div>
        </section>
      </div>
    </PageLoader>
  );
};

export default Pricing;
