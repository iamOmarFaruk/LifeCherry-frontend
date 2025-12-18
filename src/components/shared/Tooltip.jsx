import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position = 'top', delay = 0.3 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay * 1000);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const getPositionClasses = () => {
        switch (position) {
            case 'bottom':
                return 'top-full left-1/2 -translate-x-1/2 mt-2';
            case 'left':
                return 'right-full top-1/2 -translate-y-1/2 mr-2';
            case 'right':
                return 'left-full top-1/2 -translate-y-1/2 ml-2';
            case 'top':
            default:
                return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
        }
    };

    const getAnimationVariants = () => {
        switch (position) {
            case 'bottom':
                return {
                    initial: { opacity: 0, y: -8, scale: 0.95 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: -8, scale: 0.95 }
                };
            case 'left':
                return {
                    initial: { opacity: 0, x: 8, scale: 0.95 },
                    animate: { opacity: 1, x: 0, scale: 1 },
                    exit: { opacity: 0, x: 8, scale: 0.95 }
                };
            case 'right':
                return {
                    initial: { opacity: 0, x: -8, scale: 0.95 },
                    animate: { opacity: 1, x: 0, scale: 1 },
                    exit: { opacity: 0, x: -8, scale: 0.95 }
                };
            case 'top':
            default:
                return {
                    initial: { opacity: 0, y: 8, scale: 0.95 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: 8, scale: 0.95 }
                };
        }
    };

    if (!content) return children;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        {...getAnimationVariants()}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`fixed z-[9999] pointer-events-none ${getPositionClasses()}`}
                        style={{
                            position: 'absolute',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <div className="bg-gray-900 dark:bg-cherry text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 dark:border-cherry-400/20 backdrop-blur-sm">
                            {content}
                            {/* Optional: Add a small arrow */}
                            <div
                                className={`absolute w-1.5 h-1.5 bg-gray-900 dark:bg-cherry rotate-45 ${position === 'top' ? 'bottom-[-0.75px] left-1/2 -translate-x-1/2' :
                                        position === 'bottom' ? 'top-[-0.75px] left-1/2 -translate-x-1/2' :
                                            position === 'left' ? 'right-[-0.75px] top-1/2 -translate-y-1/2' :
                                                'left-[-0.75px] top-1/2 -translate-y-1/2'
                                    }`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
