// Home Page - LifeCherry
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiHeart, FiUsers, FiStar, FiLock, FiImage } from 'react-icons/fi';
import apiClient from '../utils/apiClient';
import HeroSlider from '../components/home/HeroSlider';
import PageLoader from '../components/shared/PageLoader';
import SectionHeader from '../components/shared/SectionHeader';
import MotionWrapper from '../components/shared/MotionWrapper';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuth from '../hooks/useAuth';

const Home = () => {
  useDocumentTitle('Home');
  const { firebaseUser, userProfile, authInitialized } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for authentication to be initialized before fetching lessons
    // This ensures premium/admin users get the correct content on first load
    if (!authInitialized) return;

    let isMounted = true;
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/lessons', {
          params: { limit: 100, sort: '-favoritesCount', visibility: 'public' },
        });
        if (!isMounted) return;
        setLessons(data?.lessons || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load lessons. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, [authInitialized, firebaseUser]);

  const featuredLessons = useMemo(() => {
    if (!lessons.length) return [];
    // Prioritize featured flag, otherwise fall back to favorites count
    const featured = lessons.filter((l) => l.isFeatured);
    if (featured.length) return featured.slice(0, 6);
    return [...lessons]
      .sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0))
      .slice(0, 6);
  }, [lessons]);

  const mostSavedLessons = useMemo(() => {
    return [...lessons]
      .filter((l) => l.visibility === 'public')
      .sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0))
      .slice(0, 6);
  }, [lessons]);

  const topContributors = useMemo(() => {
    if (!lessons.length) return [];
    const byAuthor = lessons.reduce((acc, lesson) => {
      const key = lesson.creatorEmail || lesson.creatorName || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          creatorEmail: lesson.creatorEmail,
          name: lesson.creatorName || 'Unknown',
          photoURL: lesson.creatorPhoto,
          lessonsCount: 0,
          totalViews: 0,
        };
      }
      acc[key].lessonsCount += 1;
      acc[key].totalViews += (lesson.views || 0);
      return acc;
    }, {});

    return Object.values(byAuthor)
      .sort((a, b) => b.lessonsCount - a.lessonsCount)
      .slice(0, 5);
  }, [lessons]);

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'm';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'k';
    return views;
  };

  return (
    <PageLoader>
      {error && (
        <div className="bg-cherry-50 text-cherry-700 px-4 py-3 text-center">{error}</div>
      )}

      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Featured Lessons Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper variant="fadeInUp">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-cherry dark:text-white">Featured Lessons</h2>
                <p className="text-text-secondary dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-base">Handpicked wisdom from our community</p>
              </div>
              <Link to="/public-lessons?sort=mostSaved" className="text-cherry hover:underline flex items-center gap-1 text-sm font-medium">
                View All <FiArrowRight />
              </Link>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center text-text-secondary">Loading lessons...</div>
            )}
            {!loading && !featuredLessons.length && (
              <div className="col-span-full text-center text-text-secondary">No lessons available yet.</div>
            )}
            {!loading && featuredLessons.map((lesson, index) => (
              <MotionWrapper key={lesson._id} delay={index * 0.1} variant="fadeInUp">
                <div className="glass-card hover:shadow-xl transition-shadow relative overflow-hidden h-full flex flex-col">
                  {/* Premium Content Lock Overlay for non-premium users */}
                  {lesson.accessLevel === 'premium' && (!userProfile?.isPremium && userProfile?.role !== 'admin') && (
                    <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                      <div className="text-center px-4 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-cherry-50 dark:bg-cherry-900/30 border border-cherry-100 dark:border-cherry-800 flex items-center justify-center shadow-sm">
                          <FiLock className="text-cherry w-8 h-8" aria-hidden />
                        </div>
                        <div>
                          <span className="badge-premium text-xs inline-flex items-center gap-1 mb-2">⭐ Premium</span>
                          <p className="text-lg font-semibold text-text-cherry dark:text-cherry-300">Upgrade to unlock this lesson</p>
                        </div>
                        <Link
                          to="/pricing"
                          className="px-4 py-2 bg-cherry text-white text-sm font-semibold rounded-full shadow hover:bg-cherry-600 transition-colors"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <div className="absolute top-3 right-3">
                      {lesson.accessLevel === 'premium' ? (
                        <span className="badge-premium text-xs px-3 py-1">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-cherry text-white text-xs font-medium rounded-full">
                      {lesson.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
                      {lesson.emotionalTone}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-text-cherry dark:text-gray-100 mb-2 line-clamp-2">
                    {lesson.title}
                  </h3>
                  <p className="text-text-secondary dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <img
                        src={lesson.creatorPhoto || 'https://i.pravatar.cc/150?img=64'}
                        alt={lesson.creatorName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs md:text-sm text-text-secondary dark:text-gray-400">{lesson.creatorName}</span>
                    </div>
                    <Link
                      to={`/lessons/${lesson._id}`}
                      className="text-cherry text-sm font-medium hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learning From Life Matters Section */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper variant="fadeInUp">
            <SectionHeader
              title="Why Learning From Life Matters"
              subtitle="Every experience holds a lesson. Here's why capturing and sharing them is powerful."
            />
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiBookOpen, title: "Preserve Wisdom", desc: "Don't let valuable lessons fade away. Document them for yourself and future generations." },
              { icon: FiHeart, title: "Mindful Reflection", desc: "Writing about experiences deepens understanding and promotes personal growth." },
              { icon: FiUsers, title: "Help Others", desc: "Your story might be exactly what someone else needs to hear today." },
              { icon: FiStar, title: "Build Community", desc: "Connect with like-minded people who value growth and shared wisdom." }
            ].map((item, index) => (
              <MotionWrapper key={index} delay={index * 0.15} variant="scaleIn">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-center border border-gray-100 dark:border-gray-600 h-full">
                  <div className="w-14 h-14 bg-cherry-100 dark:bg-cherry-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-cherry dark:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {item.desc}
                  </p>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper variant="fadeInUp">
            <SectionHeader
              title="Top Contributors of the Week"
              subtitle="Meet the amazing people sharing their wisdom"
            />
          </MotionWrapper>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {loading && (
              <div className="text-text-secondary">Loading contributors...</div>
            )}
            {!loading && !topContributors.length && (
              <div className="text-text-secondary">No contributors yet.</div>
            )}
            {!loading && topContributors.map((user, index) => (
              <MotionWrapper key={user.creatorEmail || user.name || index} delay={index * 0.1} variant="fadeInUp">
                <div className="text-center w-36 md:w-auto">
                  <div className="relative inline-block">
                    <img
                      src={user.photoURL || 'https://i.pravatar.cc/150?img=64'}
                      alt={user.name}
                      className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-cherry-200"
                    />
                    {index < 3 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-text-cherry mt-2 md:mt-3 text-sm md:text-base truncate px-2">{user.name}</h4>
                  <p className="text-text-muted text-xs md:text-sm">{user.lessonsCount} lessons</p>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Most Saved Lessons Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-white to-cherry-50 dark:from-gray-900 dark:to-[#1a1012] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper variant="fadeInUp">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-cherry dark:text-cherry-300">Most Saved Lessons</h2>
                <p className="text-text-secondary dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">The lessons our community loves most</p>
              </div>
              <Link to="/public-lessons?sort=mostSaved" className="text-cherry hover:underline flex items-center gap-1 text-sm font-medium">
                View All <FiArrowRight />
              </Link>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center text-text-secondary">Loading lessons...</div>
            )}
            {!loading && !mostSavedLessons.length && (
              <div className="col-span-full text-center text-text-secondary">No lessons available yet.</div>
            )}
            {!loading && mostSavedLessons.map((lesson, index) => (
              <MotionWrapper key={lesson._id} delay={index * 0.1} variant="fadeInUp">
                <div
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col"
                >
                  {lesson.accessLevel === 'premium' && (!userProfile?.isPremium && userProfile?.role !== 'admin') && (
                    <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="text-center px-4 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-cherry-50 dark:bg-cherry-900/30 border border-cherry-100 dark:border-cherry-800 flex items-center justify-center shadow-sm">
                          <FiLock className="text-cherry w-8 h-8" aria-hidden />
                        </div>
                        <div>
                          <span className="badge-premium text-xs inline-flex items-center gap-1 mb-2">⭐ Premium</span>
                          <p className="text-lg font-semibold text-text-cherry dark:text-cherry-300">Upgrade to unlock this lesson</p>
                        </div>
                        <Link
                          to="/pricing"
                          className="px-4 py-2 bg-cherry text-white text-sm font-semibold rounded-full shadow hover:bg-cherry-600 transition-colors"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 rounded-xl overflow-hidden h-44 bg-gradient-to-br from-cherry-50 to-white dark:from-cherry-950 dark:to-gray-800 relative flex-shrink-0">
                    {lesson.image ? (
                      <img
                        src={lesson.image}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-text-muted gap-2 text-sm">
                        <FiImage className="w-5 h-5" aria-hidden />
                        <span>Image coming soon</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {lesson.accessLevel === 'premium' ? (
                        <span className="badge-premium text-xs px-3 py-1">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-cherry text-white text-xs font-medium rounded-full">
                      {lesson.category}
                    </span>
                    {lesson.emotionalTone && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
                        {lesson.emotionalTone}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-text-cherry dark:text-cherry-300 mb-2 line-clamp-2">
                    {lesson.title}
                  </h3>
                  <p className="text-text-secondary dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center gap-3 text-text-muted dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        ❤️ {lesson.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        🔖 {lesson.favoritesCount}
                      </span>
                    </div>
                    <Link
                      to={`/lessons/${lesson._id}`}
                      className="text-cherry font-medium hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Color Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cherry-900/90 to-cherry-800/80 mix-blend-multiply backdrop-blur-[1px]"></div>
        </div>

        <MotionWrapper variant="scaleIn" className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {!firebaseUser ? (
            <>
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                Ready to Share Your Wisdom?
              </h2>
              <p className="text-white/90 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of people who are preserving their life lessons and inspiring others.
                Start your journey today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-cherry-700 font-bold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 text-sm md:text-base"
              >
                Create Your Account
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </>
          ) : (!userProfile?.isPremium && userProfile?.role !== 'admin') ? (
            <>
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                Unlock Your Full Potential
              </h2>
              <p className="text-white/90 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                Upgrade to Premium to access exclusive lessons, advanced analytics, and unlimited content.
                Take your growth to the next level.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/20 text-sm md:text-base"
              >
                Upgrade to Premium
                <FiStar className="w-5 h-5 fill-current" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                Continue Your Journey
              </h2>
              <p className="text-white/90 text-base md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                You have full access to all premium content. Keep learning and sharing your wisdom with the world.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-cherry-700 font-bold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 text-sm md:text-base"
              >
                Go to Dashboard
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </>
          )}
        </MotionWrapper>
      </section>
    </PageLoader>
  );
};

export default Home;
