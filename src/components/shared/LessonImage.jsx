import React, { useState } from 'react';
import {
    FiTrendingUp,
    FiBriefcase,
    FiUsers,
    FiSun,
    FiAlertCircle,
    FiImage,
    FiHeart,
    FiSmile,
    FiAward
} from 'react-icons/fi';

const LessonImage = ({
    src,
    alt,
    category,
    emotionalTone,
    className = "",
    iconClassName = "w-12 h-12",
    compact = false
}) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // If we have a valid src and no error, render the image
    if (src && !error) {
        return (
            <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
                <img
                    src={src}
                    alt={alt || "Lesson cover"}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onError={() => setError(true)}
                    onLoad={() => setLoaded(true)}
                />
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
                        <FiImage className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                )}
            </div>
        );
    }

    // Fallback Design Logic

    // 1. Get Gradient based on Emotional Tone
    const getGradient = (tone) => {
        const tones = {
            'Motivational': 'from-emerald-400 to-teal-600',
            'Sad': 'from-slate-400 to-slate-600',
            'Realization': 'from-indigo-400 to-violet-600',
            'Gratitude': 'from-rose-300 to-pink-500',
            'Happy': 'from-amber-300 to-orange-500',
            'Regret': 'from-gray-500 to-gray-700',
            'Hope': 'from-sky-300 to-blue-500',
            'Fear': 'from-zinc-600 to-neutral-800',
            'Anger': 'from-red-500 to-orange-700',
            'Love': 'from-pink-400 to-rose-600',
            'Funny': 'from-yellow-300 to-amber-500'
        };
        return tones[tone] || 'from-cherry-400 to-cherry-600'; // Default fallback
    };

    // 2. Get Icon based on Category
    const getIcon = (cat) => {
        const categories = {
            'Personal Growth': FiTrendingUp,
            'Career': FiBriefcase,
            'Relationships': FiUsers,
            'Mindset': FiSun,
            'Mistakes Learned': FiAlertCircle,
            'Health': FiHeart,
            'Travel': FiImage, // Just as a placeholder
            'Lifestyle': FiSmile,
            'Education': FiAward
        };

        // Return the mapped icon or a default
        return categories[cat] || FiImage;
    };

    const gradientClass = getGradient(emotionalTone);
    const IconComponent = getIcon(category);

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} ${className}`}>
            {/* Pattern Overlay - Hide in compact mode for cleaner look */}
            {!compact && (
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="currentColor" className="text-white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dotPattern)" />
                    </svg>
                </div>
            )}

            {/* Decorative Circles - Hide in compact */}
            {!compact && (
                <>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                </>
            )}

            {/* Central Icon */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-white ${compact ? 'p-1' : 'p-4'}`}>
                <div className={`${compact ? 'p-1.5' : 'p-3'} bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg ${compact ? 'mb-0' : 'mb-2'} transform transition-transform group-hover:scale-110 duration-300`}>
                    <IconComponent className={`${iconClassName} stroke-[1.5]`} />
                </div>
                {!compact && (category || emotionalTone) && (
                    <span className="text-xs font-medium uppercase tracking-wider opacity-90 text-center px-2">
                        {category || emotionalTone}
                    </span>
                )}
            </div>
        </div>
    );
};

/*
 * ┌── o m a r ──┐
 * │ @iamOmarFaruk
 * │ omarfaruk.dev
 * │ Created: 2025-12-19
 * │ Updated: 2025-12-19
 * └─ LifeCherry ───┘
 */

export default LessonImage;
