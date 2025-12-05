// Home Page - LifeCherry
import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiHeart, FiUsers, FiStar } from 'react-icons/fi';
import { getFeaturedLessons, getMostSavedLessons } from '../data/lessons';
import { users } from '../data/users';

const Home = () => {
  const featuredLessons = getFeaturedLessons();
  const mostSavedLessons = getMostSavedLessons(6);

  // Get top contributors (users with most lessons)
  const topContributors = users.slice(0, 5);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cherry-50 via-white to-secondary/20 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-cherry mb-6">
              Share Your <span className="text-cherry">Life Lessons</span>, 
              <br />Inspire Others
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-8">
              A platform where wisdom meets community. Create, store, and share meaningful 
              life lessons that help others grow and learn from your experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-capsule text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
                Get Started Free
                <FiArrowRight />
              </Link>
              <Link to="/public-lessons" className="btn-ghost-capsule text-lg px-8 py-3 inline-flex items-center justify-center">
                Browse Lessons
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Lessons Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-text-cherry">Featured Lessons</h2>
              <p className="text-text-secondary mt-2">Handpicked wisdom from our community</p>
            </div>
            <Link to="/public-lessons" className="text-cherry hover:underline flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLessons.slice(0, 6).map((lesson) => (
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
            {topContributors.map((user, index) => (
              <div key={user._id} className="text-center">
                <div className="relative inline-block">
                  <img
                    src={user.photoURL}
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
                <p className="text-text-muted text-sm">12 lessons</p>
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
            {mostSavedLessons.map((lesson) => (
              <div key={lesson._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-cherry-50 text-cherry text-xs font-medium rounded-full">
                    {lesson.category}
                  </span>
                  {lesson.accessLevel === 'premium' && (
                    <span className="badge-premium text-xs">⭐ Premium</span>
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
    </div>
  );
};

export default Home;
