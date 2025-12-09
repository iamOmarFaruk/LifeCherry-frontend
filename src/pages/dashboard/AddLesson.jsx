// Add Lesson Page - LifeCherry Dashboard
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineLockClosed,
  HiOutlineInformationCircle,
  HiOutlineGlobeAlt,
  HiOutlineLockOpen,
  HiOutlineStar
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import PageLoader from '../../components/shared/PageLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useAuth from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';

const AddLesson = () => {
  useDocumentTitle('Add Lesson');
  const navigate = useNavigate();
  const { userProfile, authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    emotionalTone: '',
    image: '',
    visibility: 'public',
    accessLevel: 'free'
  });

  const categories = [
    'Personal Growth',
    'Career',
    'Relationships',
    'Mindset',
    'Mistakes Learned'
  ];

  const emotionalTones = [
    'Motivational',
    'Sad',
    'Realization',
    'Gratitude'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.emotionalTone) {
      toast.error('Please select an emotional tone');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        emotionalTone: formData.emotionalTone,
        image: formData.image.trim() || null,
        visibility: formData.visibility,
        accessLevel: formData.accessLevel,
      };

      const response = await apiClient.post('/lessons', payload);
      
      if (response.data?.lesson) {
        toast.success('Life lesson published successfully! 🎉');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          emotionalTone: '',
          image: '',
          visibility: 'public',
          accessLevel: 'free'
        });

        // Redirect to my lessons after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard/my-lessons');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create lesson';
      toast.error(errorMessage);
      console.error('Lesson creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLoader>
      <div className="space-y-6 lg:space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Add New Life Lesson</h1>
          <p className="text-text-secondary">Share your wisdom and insights with the community</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Lesson Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-text mb-2">
                Lesson Title <span className="text-cherry">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlinePencilSquare className="text-text-muted w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., The Power of Saying No"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                  maxLength={100}
                />
              </div>
              <p className="mt-1 text-xs text-text-muted text-right">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-text mb-2">
                Full Description / Story / Insight <span className="text-cherry">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Share your life lesson in detail. What happened? What did you learn? How can others benefit from this wisdom?"
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors resize-none"
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-text-muted text-right">{formData.description.length}/2000 characters</p>
            </div>

            {/* Category & Emotional Tone - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-text mb-2">
                  Category <span className="text-cherry">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Emotional Tone */}
              <div>
                <label htmlFor="emotionalTone" className="block text-sm font-semibold text-text mb-2">
                  Emotional Tone <span className="text-cherry">*</span>
                </label>
                <select
                  id="emotionalTone"
                  name="emotionalTone"
                  value={formData.emotionalTone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select emotional tone</option>
                  {emotionalTones.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-text mb-2">
                <span className="flex items-center gap-2">
                  Featured Image
                  <span className="text-xs font-normal text-text-muted">(Optional)</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlinePhoto className="text-text-muted w-5 h-5" />
                </div>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cherry focus:ring-0 focus:outline-none transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Paste an image URL from Unsplash, Imgur, or any direct image link
              </p>

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-3">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-full max-w-md h-48 object-cover rounded-xl border border-border"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            {/* Visibility & Access Level - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  <span className="flex items-center gap-2">
                    <HiOutlineEye className="w-4 h-4" />
                    Visibility
                  </span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      formData.visibility === 'public'
                        ? 'border-cherry bg-cherry-50 text-cherry'
                        : 'border-gray-200 text-text-secondary hover:border-gray-300'
                    }`}
                  >
                    <HiOutlineGlobeAlt className="w-5 h-5" />
                    <span className="font-medium">Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      formData.visibility === 'private'
                        ? 'border-cherry bg-cherry-50 text-cherry'
                        : 'border-gray-200 text-text-secondary hover:border-gray-300'
                    }`}
                  >
                    <HiOutlineLockClosed className="w-5 h-5" />
                    <span className="font-medium">Private</span>
                  </button>
                </div>
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  <span className="flex items-center gap-2">
                    <HiOutlineSparkles className="w-4 h-4" />
                    Access Level
                  </span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, accessLevel: 'free' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      formData.accessLevel === 'free'
                        ? 'border-cherry bg-cherry-50 text-cherry'
                        : 'border-gray-200 text-text-secondary hover:border-gray-300'
                    }`}
                  >
                    <HiOutlineLockOpen className="w-5 h-5" />
                    <span className="font-medium">Free</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => userProfile?.isPremium && setFormData(prev => ({ ...prev, accessLevel: 'premium' }))}
                    disabled={!userProfile?.isPremium}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      !userProfile?.isPremium 
                        ? 'opacity-50 cursor-not-allowed border-gray-200 text-text-muted'
                        : formData.accessLevel === 'premium'
                          ? 'border-amber-400 bg-amber-50 text-amber-600 cursor-pointer'
                          : 'border-gray-200 text-text-secondary hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <HiOutlineStar className="w-5 h-5" />
                    <span className="font-medium">Premium</span>
                  </button>
                </div>
                
                {/* Tooltip for non-premium users */}
                {!userProfile?.isPremium && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <HiOutlineLockClosed className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Upgrade to Premium</strong> to create paid lessons that only premium users can access.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-cherry-50 border border-cherry-100 rounded-xl">
              <HiOutlineInformationCircle className="w-6 h-6 text-cherry flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text mb-1">Sharing Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  <li>Be authentic and share real experiences</li>
                  <li>Focus on the lesson learned, not just the story</li>
                  <li>Consider how others can apply this wisdom</li>
                  <li>Add an image to make your lesson more engaging</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-cherry text-white font-semibold rounded-xl hover:bg-cherry-dark transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-5 h-5" />
                    Publish Life Lesson
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  title: '',
                  description: '',
                  category: '',
                  emotionalTone: '',
                  image: '',
                  visibility: 'public',
                  accessLevel: 'free'
                })}
                className="px-6 py-4 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLoader>
  );
};

export default AddLesson;
