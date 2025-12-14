// Premium Interaction Buttons Component
// Unique, animated Like, Comment, and Save buttons for a premium experience
import React, { useState, useEffect } from 'react';

// ==========================================
// LIKE BUTTON - Heart burst animation
// ==========================================
export const PremiumLikeButton = ({
    isLiked,
    likesCount,
    onClick,
    disabled = false,
    formatNumber
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [particles, setParticles] = useState([]);

    const handleClick = () => {
        if (disabled) return;

        if (!isLiked) {
            // Trigger burst animation
            setIsAnimating(true);
            // Create particles
            const newParticles = Array.from({ length: 8 }, (_, i) => ({
                id: Date.now() + i,
                angle: (i * 45) + Math.random() * 20 - 10,
                distance: 30 + Math.random() * 20,
                size: 4 + Math.random() * 4,
                delay: i * 30
            }));
            setParticles(newParticles);

            setTimeout(() => {
                setIsAnimating(false);
                setParticles([]);
            }, 700);
        }

        onClick();
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`group relative flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 overflow-visible cursor-pointer
        ${disabled
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                    : isLiked
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-500 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-105'
                }`}
        >
            {/* Particle burst effect */}
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: '20px',
                        top: '50%',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
                        transform: 'translate(-50%, -50%)',
                        animation: `particleBurst 0.6s ease-out forwards`,
                        animationDelay: `${p.delay}ms`,
                        '--angle': `${p.angle}deg`,
                        '--distance': `${p.distance}px`,
                    }}
                />
            ))}

            {/* Heart icon with animation */}
            <div className={`relative transition-transform duration-300 ${isAnimating ? 'animate-heartBeat' : ''}`}>
                <svg
                    className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${isLiked ? 'fill-current' : 'stroke-current fill-transparent stroke-2'}`}
                    viewBox="0 0 24 24"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>

                {/* Glow effect when liked */}
                {isLiked && (
                    <div className="absolute inset-0 blur-md bg-white/40 rounded-full scale-150 animate-pulse" />
                )}
            </div>

            {/* Label */}
            <span className="relative z-10">{isLiked ? 'Loved' : 'Love'}</span>

            {/* Count with animation */}
            <span className={`relative z-10 min-w-[1.5rem] text-center transition-all duration-300 ${isAnimating ? 'animate-countPop' : ''}`}>
                {formatNumber ? formatNumber(likesCount) : likesCount}
            </span>

            {/* Ripple ring on hover */}
            {!disabled && !isLiked && (
                <span className="absolute inset-0 rounded-2xl border-2 border-rose-400/0 group-hover:border-rose-400/30 group-hover:scale-110 transition-all duration-500" />
            )}
        </button>
    );
};

// ==========================================
// COMMENT BUTTON - Bubble animation
// ==========================================
export const PremiumCommentButton = ({
    commentsCount,
    onClick,
    formatNumber
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base
        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
        border-2 border-gray-200 dark:border-gray-700 
        hover:border-emerald-400 dark:hover:border-emerald-500 
        hover:text-emerald-600 dark:hover:text-emerald-400
        hover:bg-emerald-50 dark:hover:bg-emerald-900/20
        hover:scale-105 transition-all duration-300 cursor-pointer"
        >
            {/* Floating bubbles on hover */}
            {isHovered && (
                <>
                    <span className="absolute -top-2 left-6 w-2 h-2 bg-emerald-400 rounded-full animate-bubbleFloat1 opacity-70" />
                    <span className="absolute -top-1 left-10 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-bubbleFloat2 opacity-60" />
                    <span className="absolute -top-3 left-8 w-1 h-1 bg-emerald-500 rounded-full animate-bubbleFloat3 opacity-80" />
                </>
            )}

            {/* Comment icon */}
            <div className="relative">
                <svg
                    className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isHovered ? 'scale-110 -translate-y-0.5' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>

                {/* Typing dots animation on hover */}
                {isHovered && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-typingDot1" />
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-typingDot2" />
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-typingDot3" />
                    </div>
                )}
            </div>

            <span className="relative z-10">Comment</span>
            <span className="relative z-10 min-w-[1.5rem] text-center">
                {formatNumber ? formatNumber(commentsCount) : commentsCount}
            </span>

            {/* Shine effect on hover */}
            <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${isHovered ? 'animate-shine' : ''}`} />
            </span>
        </button>
    );
};

// ==========================================
// SAVE/BOOKMARK BUTTON - Ribbon pull animation
// ==========================================
export const PremiumSaveButton = ({
    isSaved,
    favoritesCount,
    onClick,
    disabled = false,
    formatNumber
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showStars, setShowStars] = useState(false);

    const handleClick = () => {
        if (disabled) return;

        if (!isSaved) {
            setIsAnimating(true);
            setShowStars(true);

            setTimeout(() => setIsAnimating(false), 400);
            setTimeout(() => setShowStars(false), 800);
        }

        onClick();
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`group relative flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 overflow-visible cursor-pointer
        ${disabled
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                    : isSaved
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-105'
                }`}
        >
            {/* Star burst effect */}
            {showStars && (
                <>
                    <span className="absolute left-5 top-0 text-amber-400 animate-starBurst1">✦</span>
                    <span className="absolute left-7 -top-1 text-yellow-400 text-xs animate-starBurst2">★</span>
                    <span className="absolute left-3 top-1 text-amber-300 text-xs animate-starBurst3">✦</span>
                    <span className="absolute left-8 top-2 text-yellow-300 text-xs animate-starBurst4">✦</span>
                </>
            )}

            {/* Bookmark icon with ribbon animation */}
            <div className={`relative transition-transform duration-300 ${isAnimating ? 'animate-ribbonPull' : ''}`}>
                <svg
                    className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${isSaved ? 'fill-current' : 'stroke-current fill-transparent stroke-2'}`}
                    viewBox="0 0 24 24"
                >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>

                {/* Glow effect when saved */}
                {isSaved && (
                    <div className="absolute inset-0 blur-md bg-white/40 rounded-full scale-150 animate-pulse" />
                )}
            </div>

            <span className="relative z-10">{isSaved ? 'Saved' : 'Save'}</span>
            <span className={`relative z-10 min-w-[1.5rem] text-center transition-all duration-300 ${isAnimating ? 'animate-countPop' : ''}`}>
                {formatNumber ? formatNumber(favoritesCount) : favoritesCount}
            </span>

            {/* Shimmer effect when saved */}
            {isSaved && (
                <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </span>
            )}
        </button>
    );
};

// ==========================================
// SHARE BUTTON - Wave/Ripple effect
// ==========================================
export const PremiumShareButton = ({
    onClick,
    isOpen = false
}) => {
    return (
        <button
            onClick={onClick}
            className={`group relative flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer
        ${isOpen
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:scale-105'
                }`}
        >
            {/* Ripple rings on hover */}
            {!isOpen && (
                <>
                    <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/0 group-hover:border-blue-400/20 group-hover:scale-110 transition-all duration-500 delay-0" />
                    <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/0 group-hover:border-blue-400/10 group-hover:scale-125 transition-all duration-500 delay-100" />
                </>
            )}

            {/* Share icon with rotation effect */}
            <svg
                className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isOpen ? 'rotate-12' : 'group-hover:-rotate-12'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>

            <span className="relative z-10">Share</span>
        </button>
    );
};

// ==========================================
// REPORT BUTTON - Alert style
// ==========================================
export const PremiumReportButton = ({
    hasReported,
    onClick,
    disabled = false
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || hasReported}
            className={`group relative flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer
        ${disabled || hasReported
                    ? hasReported
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105'
                }`}
        >
            {/* Flag icon */}
            <svg
                className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${!disabled && !hasReported ? 'group-hover:animate-flagWave' : ''}`}
                viewBox="0 0 24 24"
                fill={hasReported ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
            </svg>

            <span className="relative z-10 hidden sm:inline">{hasReported ? 'Reported' : 'Report'}</span>
        </button>
    );
};

// ==========================================
// VIEWS DISPLAY - Static with icon animation
// ==========================================
export const PremiumViewsDisplay = ({
    viewsCount,
    formatNumber
}) => {
    return (
        <div className="group flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 text-sky-700 dark:text-sky-400 font-semibold text-sm md:text-base border border-sky-200/50 dark:border-sky-800/50">
            {/* Eye icon with blink animation */}
            <svg
                className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-eyeBlink"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>

            <span>{formatNumber ? formatNumber(viewsCount) : viewsCount}</span>
            <span className="hidden sm:inline">Views</span>
        </div>
    );
};

// CSS Keyframes (to be added to index.css or styled-components)
export const premiumButtonStyles = `
  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.3); }
    50% { transform: scale(0.9); }
    75% { transform: scale(1.15); }
  }
  
  @keyframes countPop {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  
  @keyframes particleBurst {
    0% {
      transform: translate(-50%, -50%) rotate(var(--angle, 0)) translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) rotate(var(--angle, 0)) translateY(calc(var(--distance, 30px) * -1)) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes bubbleFloat1 {
    0% { transform: translateY(0) scale(1); opacity: 0.7; }
    100% { transform: translateY(-20px) scale(0.5); opacity: 0; }
  }
  
  @keyframes bubbleFloat2 {
    0% { transform: translateY(0) scale(1); opacity: 0.6; }
    100% { transform: translateY(-25px) scale(0.3); opacity: 0; }
  }
  
  @keyframes bubbleFloat3 {
    0% { transform: translateY(0) scale(1); opacity: 0.8; }
    100% { transform: translateY(-15px) scale(0.4); opacity: 0; }
  }
  
  @keyframes typingDot1 {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
  }
  
  @keyframes typingDot2 {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
  }
  
  @keyframes typingDot3 {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  
  @keyframes ribbonPull {
    0%, 100% { transform: translateY(0) scale(1); }
    30% { transform: translateY(-4px) scale(0.9); }
    60% { transform: translateY(2px) scale(1.1); }
  }
  
  @keyframes starBurst1 {
    0% { transform: translate(0, 0) scale(0); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(-10px, -15px) scale(1.2); opacity: 0; }
  }
  
  @keyframes starBurst2 {
    0% { transform: translate(0, 0) scale(0); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(5px, -20px) scale(1); opacity: 0; }
  }
  
  @keyframes starBurst3 {
    0% { transform: translate(0, 0) scale(0); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(-15px, -10px) scale(0.8); opacity: 0; }
  }
  
  @keyframes starBurst4 {
    0% { transform: translate(0, 0) scale(0); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(10px, -12px) scale(0.9); opacity: 0; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  
  @keyframes flagWave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
  
  @keyframes eyeBlink {
    0%, 40%, 60%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.1); }
  }
  
  .animate-heartBeat { animation: heartBeat 0.5s ease-in-out; }
  .animate-countPop { animation: countPop 0.3s ease-out; }
  .animate-bubbleFloat1 { animation: bubbleFloat1 0.8s ease-out forwards; }
  .animate-bubbleFloat2 { animation: bubbleFloat2 0.9s ease-out 0.1s forwards; }
  .animate-bubbleFloat3 { animation: bubbleFloat3 0.7s ease-out 0.05s forwards; }
  .animate-typingDot1 { animation: typingDot1 1s ease-in-out infinite; }
  .animate-typingDot2 { animation: typingDot2 1s ease-in-out 0.2s infinite; }
  .animate-typingDot3 { animation: typingDot3 1s ease-in-out 0.4s infinite; }
  .animate-shine { animation: shine 0.8s ease-in-out; }
  .animate-ribbonPull { animation: ribbonPull 0.4s ease-out; }
  .animate-starBurst1 { animation: starBurst1 0.6s ease-out forwards; }
  .animate-starBurst2 { animation: starBurst2 0.7s ease-out 0.05s forwards; }
  .animate-starBurst3 { animation: starBurst3 0.5s ease-out 0.1s forwards; }
  .animate-starBurst4 { animation: starBurst4 0.6s ease-out 0.08s forwards; }
  .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
  .animate-flagWave { animation: flagWave 0.4s ease-in-out; }
  .animate-eyeBlink { animation: eyeBlink 1.5s ease-in-out; }
`;

export default {
    PremiumLikeButton,
    PremiumCommentButton,
    PremiumSaveButton,
    PremiumShareButton,
    PremiumReportButton,
    PremiumViewsDisplay,
    premiumButtonStyles
};
