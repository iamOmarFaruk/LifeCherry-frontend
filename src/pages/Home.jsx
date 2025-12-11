// Home Page - LifeCherry
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiHeart, FiUsers, FiStar, FiLock, FiImage } from 'react-icons/fi';
import apiClient from '../utils/apiClient';
import HeroSlider from '../components/home/HeroSlider';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useAuth from '../hooks/useAuth';

const Home = () => {
  useDocumentTitle('Home');
  const { firebaseUser, userProfile } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/lessons', {
          params: { limit: 100, sort: '-favoritesCount' },
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
  }, []);

  const featuredLessons = useMemo(() => {
    if (!lessons.length) return [];
    const featured = lessons.filter((l) => l.isFeatured);
    if (featured.length) return featured.slice(0, 6);
    return [...lessons].sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0)).slice(0, 6);
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
        <div className="bg-red-50 text-red-700 px-4 py-3 text-center">{error}</div>
      )}

      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Featured Lessons Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-cherry dark:text-white">Featured Lessons</h2>
              <p className="text-text-secondary dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-base">Handpicked wisdom from our community</p>
            </div>
            <Link to="/public-lessons?sort=mostSaved" className="text-cherry hover:underline flex items-center gap-1 text-sm font-medium">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center text-text-secondary">Loading lessons...</div>
            )}
            {!loading && !featuredLessons.length && (
              <div className="col-span-full text-center text-text-secondary">No lessons available yet.</div>
            )}
            {!loading && featuredLessons.map((lesson) => (
              <div key={lesson._id} className="glass-card hover:shadow-xl transition-shadow">
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
                  <span className="px-3 py-1 bg-cherry-50 text-cherry text-xs font-medium rounded-full">
                    {lesson.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
                    {lesson.emotionalTone}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-text-cherry dark:text-gray-100 mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-text-secondary dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={lesson.creatorPhoto}
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
            ))}
          </div>
        </div>
      </section>

      {/* Why Learning From Life Matters Section */}
      <section className="py-12 md:py-16 bg-cherry-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-cherry dark:text-cherry-300">Why Learning From Life Matters</h2>
            <p className="text-text-secondary dark:text-gray-400 mt-2 max-w-2xl mx-auto text-sm md:text-base">
              Every experience holds a lesson. Here's why capturing and sharing them is powerful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 dark:bg-cherry-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBookOpen className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry dark:text-cherry-300 mb-2">Preserve Wisdom</h3>
              <p className="text-text-secondary dark:text-gray-300 text-sm">
                Don't let valuable lessons fade away. Document them for yourself and future generations.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 dark:bg-cherry-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry dark:text-cherry-300 mb-2">Mindful Reflection</h3>
              <p className="text-text-secondary dark:text-gray-300 text-sm">
                Writing about experiences deepens understanding and promotes personal growth.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 dark:bg-cherry-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry dark:text-cherry-300 mb-2">Help Others</h3>
              <p className="text-text-secondary dark:text-gray-300 text-sm">
                Your story might be exactly what someone else needs to hear today.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 dark:bg-cherry-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry dark:text-cherry-300 mb-2">Build Community</h3>
              <p className="text-text-secondary dark:text-gray-300 text-sm">
                Connect with like-minded people who value growth and shared wisdom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight">Top Contributors of the Week</h2>
            <p className="text-text-secondary dark:text-gray-400 mt-2 md:mt-4 max-w-xl mx-auto text-base md:text-lg">
              Meet the amazing people sharing their wisdom
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {loading && (
              <div className="text-text-secondary">Loading contributors...</div>
            )}
            {!loading && !topContributors.length && (
              <div className="text-text-secondary">No contributors yet.</div>
            )}
            {!loading && topContributors.map((user, index) => (
              <div key={user.creatorEmail || user.name || index} className="text-center w-36 md:w-auto">
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
            ))}
          </div>
        </div>
      </section>

      {/* Most Saved Lessons Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-white to-cherry-50 dark:from-gray-900 dark:to-[#1a1012] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-cherry dark:text-cherry-300">Most Saved Lessons</h2>
              <p className="text-text-secondary dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">The lessons our community loves most</p>
            </div>
            <Link to="/public-lessons?sort=mostSaved" className="text-cherry hover:underline flex items-center gap-1 text-sm font-medium">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center text-text-secondary">Loading lessons...</div>
            )}
            {!loading && !mostSavedLessons.length && (
              <div className="col-span-full text-center text-text-secondary">No lessons available yet.</div>
            )}
            {!loading && mostSavedLessons.map((lesson) => (
              <div
                key={lesson._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
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

                <div className="mb-4 rounded-xl overflow-hidden h-44 bg-gradient-to-br from-cherry-50 to-white dark:from-cherry-950 dark:to-gray-800 relative">
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
                  <span className="px-3 py-1 bg-cherry-50 text-cherry text-xs font-medium rounded-full">
                    {lesson.category}
                  </span>
                  {lesson.emotionalTone && (
                    <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
                      {lesson.emotionalTone}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-text-cherry dark:text-cherry-300 mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-text-secondary dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between text-sm">
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        </div>
      </section>
    </PageLoader>
  );
};

export default Home;
