// Home Page - LifeCherry
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiHeart, FiUsers, FiStar, FiLock, FiImage } from 'react-icons/fi';
import apiClient from '../utils/apiClient';
import HeroSlider from '../components/home/HeroSlider';
import PageLoader from '../components/shared/PageLoader';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = () => {
  useDocumentTitle('Home');
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
        };
      }
      acc[key].lessonsCount += 1;
      return acc;
    }, {});

    return Object.values(byAuthor)
      .sort((a, b) => b.lessonsCount - a.lessonsCount)
      .slice(0, 5);
  }, [lessons]);

  return (
    <PageLoader>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 text-center">{error}</div>
      )}

      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Featured Lessons Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-text-cherry">Featured Lessons</h2>
              <p className="text-text-secondary mt-2">Handpicked wisdom from our community</p>
            </div>
            <Link to="/public-lessons?sort=mostSaved" className="text-cherry hover:underline flex items-center gap-1">
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
                <img
                  src={lesson.image}
                  alt={lesson.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-cherry-50 text-cherry text-xs font-medium rounded-full">
                    {lesson.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
                    {lesson.emotionalTone}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-cherry mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={lesson.creatorPhoto}
                      alt={lesson.creatorName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-text-secondary">{lesson.creatorName}</span>
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
      <section className="py-16 bg-cherry-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-cherry">Why Learning From Life Matters</h2>
            <p className="text-text-secondary mt-2 max-w-2xl mx-auto">
              Every experience holds a lesson. Here's why capturing and sharing them is powerful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBookOpen className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry mb-2">Preserve Wisdom</h3>
              <p className="text-text-secondary text-sm">
                Don't let valuable lessons fade away. Document them for yourself and future generations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry mb-2">Mindful Reflection</h3>
              <p className="text-text-secondary text-sm">
                Writing about experiences deepens understanding and promotes personal growth.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry mb-2">Help Others</h3>
              <p className="text-text-secondary text-sm">
                Your story might be exactly what someone else needs to hear today.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-cherry-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-7 h-7 text-cherry" />
              </div>
              <h3 className="text-lg font-semibold text-text-cherry mb-2">Build Community</h3>
              <p className="text-text-secondary text-sm">
                Connect with like-minded people who value growth and shared wisdom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-cherry">Top Contributors of the Week</h2>
            <p className="text-text-secondary mt-2">
              Meet the amazing people sharing their wisdom
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {loading && (
              <div className="text-text-secondary">Loading contributors...</div>
            )}
            {!loading && !topContributors.length && (
              <div className="text-text-secondary">No contributors yet.</div>
            )}
            {!loading && topContributors.map((user, index) => (
              <div key={user.creatorEmail || user.name || index} className="text-center">
                <div className="relative inline-block">
                  <img
                    src={user.photoURL || 'https://i.pravatar.cc/150?img=64'}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-cherry-200"
                  />
                  {index < 3 && (
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-text-cherry mt-3">{user.name}</h4>
                <p className="text-text-muted text-sm">{user.lessonsCount} lessons</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Saved Lessons Section */}
      <section className="py-16 bg-gradient-to-br from-white to-cherry-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-text-cherry">Most Saved Lessons</h2>
              <p className="text-text-secondary mt-2">The lessons our community loves most</p>
            </div>
            <Link to="/public-lessons" className="text-cherry hover:underline flex items-center gap-1">
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
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {lesson.accessLevel === 'premium' && (
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center px-4 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-cherry-50 border border-cherry-100 flex items-center justify-center shadow-sm">
                        <FiLock className="text-cherry w-8 h-8" aria-hidden />
                      </div>
                      <div>
                        <span className="badge-premium text-xs inline-flex items-center gap-1 mb-2">⭐ Premium</span>
                        <p className="text-lg font-semibold text-text-cherry">Upgrade to unlock this lesson</p>
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

                <div className="mb-4 rounded-xl overflow-hidden h-44 bg-gradient-to-br from-cherry-50 to-white">
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
                <h3 className="text-lg font-semibold text-text-cherry mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-text-muted">
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
      <section className="py-20 bg-gradient-to-r from-cherry to-cherry-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Share Your Wisdom?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of people who are preserving their life lessons and inspiring others. 
            Start your journey today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-cherry font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            Create Your Account
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </PageLoader>
  );
};

export default Home;
