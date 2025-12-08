// Profile Page - LifeCherry Dashboard
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePencilSquare,
  HiOutlineBookOpen,
  HiOutlineHeart,
  HiOutlineStar,
  HiOutlineCamera,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlinePhoto,
  HiOutlineEye,
  HiOutlineExclamationTriangle,
  HiOutlineLockClosed,
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineBookmark
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import Loading from '../../components/shared/Loading';
import { emotionalTones } from '../../data/lessons';

const Profile = () => {
  useDocumentTitle('My Profile');
  const {
    firebaseUser,
    userProfile,
    authLoading,
    profileLoading,
    authInitialized,
    updateProfileInfo,
    profileRefetch,
  } = useAuth();

  const userEmail = firebaseUser?.email?.toLowerCase() || '';

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({ name: '', photoURL: '' });

  const lessonsQuery = useQuery({
    queryKey: ['my-lessons', userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await apiClient.get(`/lessons/user/${userEmail}`);
      return res.data?.lessons || [];
    },
    retry: 1,
  });

  const profile = useMemo(
    () => ({
      name:
        userProfile?.name ||
        firebaseUser?.displayName ||
        firebaseUser?.email?.split('@')[0] ||
        'User',
      email: userProfile?.email || firebaseUser?.email || '',
      photoURL: userProfile?.photoURL || firebaseUser?.photoURL || '',
      isPremium: !!userProfile?.isPremium,
      role: userProfile?.role || 'user',
      createdAt: userProfile?.createdAt || firebaseUser?.metadata?.creationTime,
    }),
    [userProfile, firebaseUser]
  );

  useEffect(() => {
    setEditFormData({
      name: profile.name || '',
      photoURL: profile.photoURL || '',
    });
  }, [profile.name, profile.photoURL]);

  const lessons = useMemo(() => lessonsQuery.data || [], [lessonsQuery.data]);

  // Get user's public lessons only (sorted by newest first)
  const publicLessons = useMemo(() => {
    return lessons
      .filter((lesson) => lesson.visibility === 'public')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [lessons]);

  const privateLessons = useMemo(
    () => lessons.filter((lesson) => lesson.visibility === 'private'),
    [lessons]
  );

  const draftLessons = useMemo(
    () => lessons.filter((lesson) => lesson.visibility === 'draft'),
    [lessons]
  );

  // Stats
  const stats = {
    totalLessons: lessons.length,
    publicLessons: publicLessons.length,
    privateLessons: privateLessons.length,
    drafts: draftLessons.length,
    totalLikes: lessons.reduce((sum, l) => sum + (l.likesCount || 0), 0),
    totalFavorites: lessons.reduce((sum, l) => sum + (l.favoritesCount || 0), 0),
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfileInfo({
        name: editFormData.name.trim(),
        photoURL: editFormData.photoURL.trim(),
      });
      await profileRefetch();
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    setEditFormData({
      name: profile.name,
      photoURL: profile.photoURL
    });
    setShowEditModal(true);
  };

  // Get emotional tone styling
  const getToneStyle = (tone) => {
    const toneConfig = emotionalTones.find(t => t.value === tone);
    return toneConfig ? {
      bg: `bg-${toneConfig.color}-50`,
      text: `text-${toneConfig.color}-600`,
      emoji: toneConfig.emoji
    } : { bg: 'bg-gray-50', text: 'text-gray-600', emoji: '💭' };
  };

  const isLoading = authLoading || profileLoading || !authInitialized || lessonsQuery.isLoading;

  if (isLoading) {
    return <Loading />;
  }

  if (!firebaseUser) {
    return (
      <div className="p-6 sm:p-10 text-center">
        <h1 className="text-2xl font-bold text-text mb-2">Please sign in</h1>
        <p className="text-text-secondary mb-4">Log in to view and update your profile.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors"
        >
          <HiOutlineLockClosed className="w-5 h-5" />
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">My Profile</h1>
        <p className="text-text-secondary">Manage your profile and view your public lessons</p>
      </div>

      {lessonsQuery.isError && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
          <div className="flex items-start gap-2">
            <HiOutlineExclamationTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Could not load your lessons</p>
              <p className="text-sm text-amber-900/90">
                {lessonsQuery.error?.response?.data?.message || lessonsQuery.error?.message || 'Please try again shortly.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Photo */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-cherry-100 shadow-lg">
              {profile.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cherry-100 flex items-center justify-center">
                  <HiOutlineUser className="w-12 h-12 text-cherry-300" />
                </div>
              )}
            </div>
            {/* Premium badge */}
            {profile.isPremium && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <HiOutlineStar className="w-3.5 h-3.5" />
                <span>Premium</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-text">{profile.name}</h2>
              <button
                onClick={openEditModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cherry-50 hover:bg-cherry-100 text-cherry rounded-xl transition-colors text-sm font-medium"
              >
                <HiOutlinePencilSquare className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-text-secondary">
                <HiOutlineEnvelope className="w-5 h-5" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-text-secondary">
                <HiOutlineCalendarDays className="w-5 h-5" />
                <span>Member since {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* Upgrade CTA for Free Users */}
            {!profile.isPremium && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600">
                <HiOutlineUser className="w-5 h-5" />
                <span className="font-medium">Free Plan</span>
                <Link 
                  to="/pricing" 
                  className="ml-2 text-cherry hover:text-cherry-dark font-semibold underline"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-8 border-t border-border">
          <div className="bg-cherry-50 rounded-xl p-4 text-center group hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-cherry-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineBookOpen className="w-5 h-5 text-cherry" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cherry mb-1">{stats.totalLessons}</div>
            <div className="text-sm text-text-secondary">Total Lessons</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center group hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineEye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{stats.publicLessons}</div>
            <div className="text-sm text-text-secondary">Public</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-center group hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineLockClosed className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-600 mb-1">{stats.privateLessons}</div>
            <div className="text-sm text-text-secondary">Private</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center group hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineStar className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">{stats.drafts}</div>
            <div className="text-sm text-text-secondary">Drafts</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center group hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineHeart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">{stats.totalLikes}</div>
            <div className="text-sm text-text-secondary">Likes Received</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center group hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineBookmark className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stats.totalFavorites}</div>
            <div className="text-sm text-text-secondary">Favorites</div>
          </div>
        </div>
      </div>

      {/* Public Lessons Section */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-text mb-1">My Public Lessons</h3>
            <p className="text-text-secondary text-sm">All your publicly shared lessons</p>
          </div>
          <Link
            to="/dashboard/my-lessons"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors text-sm font-medium"
          >
            <HiOutlineBookOpen className="w-4 h-4" />
            <span>Manage All Lessons</span>
          </Link>
        </div>

        {publicLessons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-cherry-50 rounded-2xl flex items-center justify-center">
              <HiOutlineBookOpen className="w-10 h-10 text-cherry-300" />
            </div>
            <h4 className="text-lg font-semibold text-text mb-2">No Public Lessons Yet</h4>
            <p className="text-text-secondary mb-4">Start sharing your wisdom with the community</p>
            <Link
              to="/dashboard/add-lesson"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors font-medium"
            >
              <HiOutlineBookOpen className="w-5 h-5" />
              <span>Add Your First Lesson</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicLessons.map(lesson => {
              const toneStyle = getToneStyle(lesson.emotionalTone);
              return (
                <div 
                  key={lesson._id}
                  className="bg-bg rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Lesson Image */}
                  <div className="relative h-40 overflow-hidden">
                    {lesson.image ? (
                      <img 
                        src={lesson.image} 
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cherry-100 to-cherry-200 flex items-center justify-center">
                        <HiOutlinePhoto className="w-12 h-12 text-cherry-300" />
                      </div>
                    )}
                    {/* Access Level Badge */}
                    <div className="absolute top-3 left-3">
                      {lesson.accessLevel === 'premium' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-semibold rounded-full shadow">
                          <HiOutlineStar className="w-3.5 h-3.5" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full">
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          Free
                        </span>
                      )}
                    </div>
                    {/* Featured Badge */}
                    {lesson.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cherry/90 text-white text-xs font-semibold rounded-full">
                          <HiOutlineSparkles className="w-3.5 h-3.5" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Category & Tone */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-cherry-50 text-cherry text-xs font-medium rounded-full">
                        {lesson.category}
                      </span>
                      <span className={`px-2.5 py-1 ${toneStyle.bg} ${toneStyle.text} text-xs font-medium rounded-full flex items-center gap-1`}>
                        <span>{toneStyle.emoji}</span>
                        {lesson.emotionalTone}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-semibold text-text mb-2 line-clamp-2 group-hover:text-cherry transition-colors">
                      {lesson.title}
                    </h4>

                    {/* Description */}
                    <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                      {lesson.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <HiOutlineHeart className="w-4 h-4 text-red-500" />
                          {lesson.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineStar className="w-4 h-4 text-amber-500" />
                          {lesson.favoritesCount}
                        </span>
                      </div>
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="text-cherry hover:text-cherry-dark font-medium flex items-center gap-1"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold text-text">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              {/* Profile Photo Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-cherry-100">
                    {editFormData.photoURL ? (
                      <img 
                        src={editFormData.photoURL} 
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-cherry-100 flex items-center justify-center">
                        <HiOutlineUser className="w-10 h-10 text-cherry-300" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cherry rounded-full flex items-center justify-center shadow-lg">
                    <HiOutlineCamera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xs text-text-secondary text-center">
                  Enter a URL for your profile photo
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Display Name <span className="text-cherry">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-cherry focus:ring-2 focus:ring-cherry/20 outline-none transition-all"
                  required
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  name="photoURL"
                  value={editFormData.photoURL}
                  onChange={handleEditChange}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-cherry focus:ring-2 focus:ring-cherry/20 outline-none transition-all"
                />
                <p className="text-xs text-text-secondary mt-1.5">
                  Paste a direct link to your profile image
                </p>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-text-secondary cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <HiOutlineLockClosed className="w-5 h-5 text-text-secondary" />
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-1.5">
                  Email cannot be changed for security reasons
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-border text-text-secondary rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-cherry text-white rounded-xl hover:bg-cherry-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckCircle className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
