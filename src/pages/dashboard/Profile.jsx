// Profile Page - LifeCherry Dashboard
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  HiOutlineBookmark,
  HiOutlineShieldCheck
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
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const userEmail = firebaseUser?.email?.toLowerCase() || '';

  const profile = useMemo(
    () => ({
      name:
        userProfile?.name ||
        firebaseUser?.displayName ||
        firebaseUser?.email?.split('@')[0] ||
        'User',
      email: userProfile?.email || firebaseUser?.email || '',
      photoURL: userProfile?.photoURL || firebaseUser?.photoURL || '',
      bio: userProfile?.bio || '',
      isPremium: !!userProfile?.isPremium || userProfile?.role === 'admin',
      role: userProfile?.role || 'user',
      createdAt: userProfile?.createdAt || firebaseUser?.metadata?.creationTime,
      status: userProfile?.status || 'active',
      disableRequestDate: userProfile?.disableRequestDate,
    }),
    [userProfile, firebaseUser]
  );

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disableReason, setDisableReason] = useState('');

  // Edit form state
  const [editFormData, setEditFormData] = useState({ name: '', photoURL: '', bio: '' });

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioContent, setBioContent] = useState('');

  useEffect(() => {
    setBioContent(profile.bio || '');
  }, [profile.bio]);

  const handleSaveBio = async () => {
    try {
      await updateProfileInfo({ bio: bioContent });
      setIsEditingBio(false);
      toast.success('Bio updated successfully');
    } catch (error) {
      toast.error('Failed to update bio');
    }
  };

  const handleRequestDisable = () => {
    setShowDisableModal(true);
  };

  const submitDisableRequest = async (e) => {
    e.preventDefault();
    try {
      setIsDisabling(true);
      await apiClient.post('/users/request-disable', { reason: disableReason });
      await profileRefetch();
      toast.success('Disable request submitted');
      setShowDisableModal(false);
      setDisableReason('');
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCancelDisable = async () => {
    try {
      setIsDisabling(true);
      await apiClient.post('/users/cancel-disable-request');
      await profileRefetch();
      toast.success('Disable request cancelled');
    } catch (error) {
      toast.error('Failed to cancel request');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete('/users/me');
      await logout();
      toast.success('Account deleted permanently');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const lessonsQuery = useQuery({
    queryKey: ['my-lessons', userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await apiClient.get(`/lessons/user/${userEmail}`);
      return res.data?.lessons || [];
    },
    retry: 1,
  });

  useEffect(() => {
    setEditFormData({
      name: profile.name || '',
      photoURL: profile.photoURL || '',
      bio: profile.bio || '',
    });
  }, [profile.name, profile.photoURL, profile.bio]);

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
      photoURL: profile.photoURL,
      bio: profile.bio
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
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cherry mb-2 flex items-center gap-3">
          <HiOutlineUser className="w-10 h-10" />
          My Profile
        </h1>
        <p className="text-gray-600">Manage your profile and view your public lessons</p>
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
            {/* User Status Badge */}
            {profile.role === 'admin' ? (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white z-10">
                <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
            ) : profile.isPremium ? (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white z-10">
                <HiOutlineStar className="w-3.5 h-3.5" />
                <span>Premium</span>
              </div>
            ) : (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white z-10">
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                <span>Starter</span>
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
              <div className="flex items-center gap-2 text-sm mt-1">
                <HiOutlineSparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-text-secondary">Currently an Apprentice.</span>
                <Link 
                  to="/pricing" 
                  className="text-cherry font-semibold hover:underline"
                >
                  Prove you're a Master & Upgrade
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* About Me Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">About Me</h3>
          </div>
          
          {isEditingBio ? (
            <div className="bg-white rounded-xl border-2 border-cherry-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <textarea
                value={bioContent}
                onChange={(e) => setBioContent(e.target.value)}
                placeholder="Tell us a little about yourself..."
                className="w-full p-4 min-h-[150px] outline-none resize-y text-text leading-relaxed placeholder:text-gray-300"
                autoFocus
              />
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs text-text-secondary font-medium">
                  {bioContent.length}/500 characters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioContent(profile.bio || '');
                    }}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-2 text-sm font-bold text-white bg-cherry hover:bg-cherry-dark rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95"
                  >
                    Save Bio
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingBio(true)}
              className="group relative rounded-xl transition-all duration-200 cursor-text"
            >
              {profile.bio ? (
                <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap p-4 -ml-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  {profile.bio}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-text-secondary">
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 hover:border-cherry-200 hover:bg-cherry-50/30 transition-all cursor-pointer group">
                  <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <HiOutlinePencilSquare className="w-6 h-6 text-cherry-300 group-hover:text-cherry" />
                  </div>
                  <h4 className="text-text font-medium mb-1">Write your bio</h4>
                  <p className="text-text-muted text-sm">Share your story with the community</p>
                </div>
              )}
            </div>
          )}
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

        {/* Danger Zone */}
        <div className="mt-8 border-t border-border pt-8">
          <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <HiOutlineExclamationTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {profile.role === 'admin' ? (
              <>
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Permanently
                </button>
              </>
            ) : (
              <>
                <div>
                  <h4 className="font-medium text-red-900">Disable Account</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Request to disable your account. Your profile and lessons will be hidden from public view.
                    Admin will review your request.
                  </p>
                  {profile.status === 'disable_requested' && (
                    <p className="text-sm font-medium text-amber-600 mt-2">
                      Request submitted on {new Date(profile.disableRequestDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {profile.status === 'disable_requested' ? (
                  <button
                    onClick={handleCancelDisable}
                    disabled={isDisabling}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                  >
                    {isDisabling ? 'Processing...' : 'Cancel Request'}
                  </button>
                ) : (
                  <button
                    onClick={handleRequestDisable}
                    disabled={isDisabling}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isDisabling ? 'Processing...' : 'Request Disable'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
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

              {/* Bio - Removed from modal as it is now inline */}
              {/* <div>
                <label className="block text-sm font-medium text-text mb-2">
                  About Me
                </label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleEditChange}
                  placeholder="Tell us a little about yourself..."
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-cherry focus:ring-2 focus:ring-cherry/20 outline-none transition-all resize-none"
                />
                <p className="text-xs text-text-secondary mt-1.5 text-right">
                  {editFormData.bio?.length || 0}/500 characters
                </p>
              </div> */}

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

      {/* Disable Account Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 p-6 border-b border-border bg-red-50 rounded-t-2xl">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Disable Account</h3>
                <p className="text-sm text-red-700">This action will hide your profile</p>
              </div>
            </div>

            <form onSubmit={submitDisableRequest} className="p-6 space-y-4">
              <p className="text-text-secondary">
                We're sorry to see you go. Please let us know why you want to disable your account. 
                Your feedback helps us improve.
              </p>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Reason for disabling <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  placeholder="I'm taking a break because..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisableReason('');
                  }}
                  className="flex-1 px-4 py-3 border border-border text-text-secondary rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisabling || !disableReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDisabling ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 p-6 border-b border-border bg-red-50 rounded-t-2xl">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Delete Account Permanently</h3>
                <p className="text-sm text-red-700">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-text-secondary">
                Are you sure you want to delete your account? This will permanently remove your profile, lessons, comments, and all other data associated with your account.
              </p>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-sm text-red-800 font-medium">
                  Warning: This action is irreversible. You will lose access to all your content immediately.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-border text-text-secondary rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Yes, Delete My Account</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
