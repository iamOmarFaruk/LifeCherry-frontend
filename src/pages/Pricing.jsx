// Pricing Page - LifeCherry
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiStar, FiZap, FiShield, FiAward, FiTrendingUp, FiUnlock, FiBookOpen, FiHeart, FiChevronDown, FiGlobe, FiEye, FiDownload, FiBarChart2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiClient';

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

  // Import apiClient at the top (I will add it to imports in a separate check if needed, but here I replace the function)
  const handleUpgrade = async () => {
    if (!firebaseUser) {
      navigate('/login', { state: { from: '/pricing' } });
      toast.error('Please sign in to upgrade');
      return;
    }
    setIsLoading(true);
    try {
      // Call backend to create checkout session
      const { data } = await apiClient.post('/payments/create-checkout-session');
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  // Feature comparison data
  const features = [
    {
      feature: 'Life Lesson Creation',
      description: 'The core of LifeCherry. Share your wisdom with the world.',
      free: 'Up to 10 lessons',
      premium: 'Unrestricted creation',
      icon: FiBookOpen,
      isPremiumOnly: false,
      gridSpan: ''
    },
    {
      feature: 'Visibility & Access',
      description: 'Explore wisdom from all creators.',
      free: 'Limit to free content',
      premium: 'Access everything',
      icon: FiEye,
      isPremiumOnly: false
    },
    {
      feature: 'Premium Content',
      description: 'Exclusive, high-value lessons for elite members.',
      free: 'Closed',
      premium: 'Unlimited access',
      icon: FiUnlock,
      isPremiumOnly: true
    },
    {
      feature: 'Global Reach',
      description: 'Get your lessons featured in front of a global audience.',
      free: 'Standard exposure',
      premium: 'Priority top listing',
      icon: FiGlobe,
      isPremiumOnly: true,
      gridSpan: ''
    },
    {
      feature: 'Ad-Free Journey',
      description: 'Zero distractions while you learn and grow.',
      free: 'Includes ads',
      premium: '100% Ad-free',
      icon: FiZap,
      isPremiumOnly: true
    },
    {
      feature: 'Creator Identity',
      description: 'Get recognized as a top-tier wise contributor.',
      free: 'Standard profile',
      premium: 'Elite verified badge',
      icon: FiAward,
      isPremiumOnly: true
    },
    {
      feature: 'Deep Analytics',
      description: 'Track how your wisdom impacts others.',
      free: 'Basic daily stats',
      premium: 'Advanced insights',
      icon: FiBarChart2,
      isPremiumOnly: false
    },
    {
      feature: 'Knowledge Portability',
      description: 'Keep your lessons offline and ready to share.',
      free: 'Cloud only',
      premium: 'Download as PDF',
      icon: FiDownload,
      isPremiumOnly: true
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
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100 dark:from-black dark:via-black dark:to-black py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg mb-8">
              <FiStar className="w-6 h-6" />
              <span>Premium Member</span>
            </div>

            {/* Success Message */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-800">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-4">
                You're a Premium Member! ⭐
              </h1>
              <p className="text-text-secondary dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Thank you for being a premium member. You have access to all features and exclusive content.
              </p>

              {/* Premium Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-cherry-50 dark:bg-cherry/10 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary dark:text-white">Unlimited lessons</span>
                </div>
                <div className="bg-cherry-50 dark:bg-cherry/10 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary dark:text-white">Premium content access</span>
                </div>
                <div className="bg-cherry-50 dark:bg-cherry/10 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary dark:text-white">Priority listing</span>
                </div>
                <div className="bg-cherry-50 dark:bg-cherry/10 rounded-xl p-4 flex items-center gap-3">
                  <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-text-primary dark:text-white">Ad-free experience</span>
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
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-cherry-50 via-white to-cherry-100 dark:from-black dark:via-black dark:to-black">
        {/* Header Section */}
        <section className="py-10 md:py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-cherry-100 dark:bg-cherry/20 text-cherry px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <FiZap className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Upgrade Your Experience
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-white mb-3 md:mb-4">
              Unlock Premium Features
            </h1>
            <p className="text-text-secondary dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
              Get unlimited access to all lessons, create premium content, and join our exclusive community of wisdom seekers.
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="pb-10 md:pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Free Plan Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-800 relative order-2 md:order-1">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-text-primary dark:text-white mb-1 md:mb-2">Free Plan</h3>
                  <p className="text-text-secondary dark:text-gray-400 text-xs md:text-sm">Perfect for getting started</p>
                </div>
                <div className="mb-4 md:mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-text-primary dark:text-white">৳0</span>
                  <span className="text-text-muted dark:text-gray-500 ml-2 text-sm md:text-base">forever</span>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-sm md:text-base">
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300">Up to 10 lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300">View free public lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300">Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300">Save to favorites</span>
                  </li>
                  <li className="flex items-center gap-3 text-text-muted dark:text-gray-600">
                    <FiX className="w-5 h-5 flex-shrink-0" />
                    <span>Premium content access</span>
                  </li>
                  <li className="flex items-center gap-3 text-text-muted dark:text-gray-600">
                    <FiX className="w-5 h-5 flex-shrink-0" />
                    <span>Create premium lessons</span>
                  </li>
                </ul>
                <button
                  disabled
                  className="w-full py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-text-muted dark:text-gray-500 font-medium cursor-not-allowed text-sm md:text-base"
                >
                  Current Plan
                </button>
              </div>

              {/* Premium Plan Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 md:p-8 border-2 border-cherry relative overflow-hidden order-1 md:order-2">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-cherry to-cherry-dark text-white px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-semibold transform rotate-0 origin-top-right rounded-bl-xl">
                    <span className="flex items-center gap-1">
                      <FiStar className="w-3.5 h-3.5 md:w-4 md:h-4" /> Most Popular
                    </span>
                  </div>
                </div>

                <div className="mb-4 md:mb-6 mt-2 md:mt-4">
                  <h3 className="text-lg md:text-xl font-bold text-text-primary dark:text-white mb-1 md:mb-2">Premium Plan</h3>
                  <p className="text-text-secondary dark:text-gray-400 text-xs md:text-sm">For serious wisdom seekers</p>
                </div>
                <div className="mb-4 md:mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-cherry">৳1,500</span>
                  <span className="text-text-muted dark:text-gray-500 ml-2 text-sm md:text-base">one-time payment</span>
                  <p className="text-xs md:text-sm text-success font-medium mt-1">Lifetime access!</p>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-sm md:text-base">
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300 font-medium">Unlimited lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300 font-medium">All lessons (Free + Premium)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300 font-medium">Create premium lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300 font-medium">Ad-free experience</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300 font-medium">Priority listing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-300 font-medium">Premium creator badge</span>
                  </li>
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full btn-capsule py-3 text-base md:text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
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

        {/* Modern Bento Grid Feature Section */}
        <section className="py-16 md:py-24 px-4 bg-white dark:bg-black overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary dark:text-white mb-6 tracking-tight">
                Compare Plan <span className="text-cherry">Excellence</span>
              </h2>
              <p className="text-text-secondary dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Choose the journey that fits your quest for wisdom. Switch up whenever you're ready.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr"
            >
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 20
                      }
                    }
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  className={`relative group rounded-[2.5rem] p-8 overflow-hidden border transition-shadow duration-500 ${item.isPremiumOnly
                    ? 'bg-gradient-to-br from-cherry-50/50 to-white dark:from-cherry/5 dark:to-gray-900 border-cherry/20 hover:border-cherry/40'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-cherry/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Floating Icon Container */}
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                        className={`p-4 rounded-2xl ${item.isPremiumOnly ? 'bg-cherry/10 text-cherry' : 'bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-white'}`}
                      >
                        <item.icon className="w-8 h-8" />
                      </motion.div>
                      {item.isPremiumOnly && (
                        <motion.span
                          initial={{ rotate: -10 }}
                          animate={{ rotate: 0 }}
                          className="flex items-center gap-1.5 bg-cherry text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-cherry/20"
                        >
                          <FiStar className="w-3 h-3 fill-white" /> Premium
                        </motion.span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-text-primary dark:text-white mb-3 group-hover:text-cherry transition-colors duration-300">
                      {item.feature}
                    </h3>
                    <p className="text-text-secondary dark:text-gray-400 text-base mb-8 flex-grow leading-relaxed">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-gray-800/50">
                      <div className="group-hover:translate-x-1 transition-transform duration-300">
                        <p className="text-xs uppercase font-bold text-text-muted dark:text-gray-500 mb-2 tracking-widest">Free Plan</p>
                        <div className="flex items-center gap-2">
                          {item.free === 'Closed' ? (
                            <FiX className="w-4 h-4 text-gray-400" />
                          ) : (
                            <FiCheck className="w-4 h-4 text-success" />
                          )}
                          <span className={`text-sm md:text-base font-semibold ${item.free === 'Closed' ? 'text-text-muted dark:text-gray-600' : 'text-text-primary dark:text-white'}`}>
                            {item.free}
                          </span>
                        </div>
                      </div>
                      <div className="border-l border-gray-100 dark:border-gray-800/50 pl-4 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                        <p className="text-xs uppercase font-bold text-cherry/80 mb-2 tracking-widest">Premium Plan</p>
                        <div className="flex items-center gap-2">
                          <FiCheck className="w-4 h-4 text-cherry" />
                          <span className="text-sm md:text-base font-bold text-text-primary dark:text-white">
                            {item.premium}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 px-4 bg-cherry-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-white mb-4">Why Go Premium?</h2>
              <p className="text-text-secondary dark:text-gray-400 text-lg">Unlock the full potential of LifeCherry</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 text-center border border-transparent dark:border-gray-800"
                >
                  <div className="w-16 h-16 bg-cherry-100 dark:bg-cherry/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group">
                    <benefit.icon className="w-8 h-8 text-cherry" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">{benefit.title}</h3>
                  <p className="text-text-secondary dark:text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-10 md:py-16 px-4 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <FiShield className="w-5 h-5 md:w-6 md:h-6 text-success" />
              <span className="text-base md:text-lg font-semibold text-text-primary dark:text-white">Secure Payment</span>
            </div>
            <p className="text-text-secondary dark:text-gray-400 text-sm md:text-base mb-6 md:mb-8 px-4">
              Your payment is processed securely through Stripe. We never store your card details.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 text-text-muted dark:text-gray-500">
                <FiShield className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted dark:text-gray-500">
                <FiCheck className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">Money-back Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted dark:text-gray-500">
                <FiHeart className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">Lifetime Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 md:py-16 px-4 bg-cherry-50 dark:bg-gray-950">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-white mb-2 md:mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-4 text-left cursor-pointer transition-colors ${openFaq === index ? 'bg-cherry-50 dark:bg-cherry/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <h3 className="font-semibold text-text-primary dark:text-white text-sm md:text-[15px] pr-4">{faq.question}</h3>
                    <FiChevronDown
                      className={`w-4 h-4 md:w-5 md:h-5 text-cherry flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="px-4 md:px-5 pb-3 md:pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-text-secondary dark:text-gray-400 text-xs md:text-sm leading-relaxed pt-3">{faq.answer}</p>
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
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80')`
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
