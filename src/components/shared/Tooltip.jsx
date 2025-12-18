import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position: initialPosition = 'top', delay = 0.3 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState(initialPosition);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const timeoutId = useRef(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let targetPosition = initialPosition;
        let top = 0;
        let left = 0;

        // Helper to check and flip position if needed
        const calculateCoords = (pos) => {
            const centerX = triggerRect.left + triggerRect.width / 2;
            const centerY = triggerRect.top + triggerRect.height / 2;

            let t = 0;
            let l = 0;

            switch (pos) {
                case 'top':
                    t = triggerRect.top - 8;
                    l = centerX;
                    break;
                case 'bottom':
                    t = triggerRect.bottom + 8;
                    l = centerX;
                    break;
                case 'left':
                    t = centerY;
                    l = triggerRect.left - 8;
                    break;
                case 'right':
                    t = centerY;
                    l = triggerRect.right + 8;
                    break;
                default:
                    t = triggerRect.top - 8;
                    l = centerX;
            }
            return { top: t, left: l };
        };

        // Initial check
        let newCoords = calculateCoords(targetPosition);

        // Simple boundary check & flip logic
        if (targetPosition === 'top' && newCoords.top < 20) {
            targetPosition = 'bottom';
            newCoords = calculateCoords('bottom');
        } else if (targetPosition === 'bottom' && newCoords.top > viewportHeight - 40) {
            targetPosition = 'top';
            newCoords = calculateCoords('top');
        } else if (targetPosition === 'left' && newCoords.left < 20) {
            targetPosition = 'right';
            newCoords = calculateCoords('right');
        } else if (targetPosition === 'right' && newCoords.left > viewportWidth - 20) {
            targetPosition = 'left';
            newCoords = calculateCoords('left');
        }

        // Horizontal Clamping (for top/bottom tooltips)
        if (targetPosition === 'top' || targetPosition === 'bottom') {
            const buffer = 80; // Estimated half-width of tooltip
            if (newCoords.left < buffer) {
                newCoords.left = buffer;
            } else if (newCoords.left > viewportWidth - buffer) {
                newCoords.left = viewportWidth - buffer;
            }
        }

        setPosition(targetPosition);
        setCoords(newCoords);
    };

    const handleMouseEnter = () => {
        timeoutId.current = setTimeout(() => {
            updatePosition();
            setIsVisible(true);
        }, delay * 1000);
    };

    const handleMouseLeave = () => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        setIsVisible(false);
    };

    useLayoutEffect(() => {
        if (isVisible) {
            const handleUpdate = () => updatePosition();
            window.addEventListener('scroll', handleUpdate, { passive: true });
            window.addEventListener('resize', handleUpdate, { passive: true });
            return () => {
                window.removeEventListener('scroll', handleUpdate);
                window.removeEventListener('resize', handleUpdate);
            };
        }
    }, [isVisible]);

    const getAnimationVariants = () => {
        const variants = {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 }
        };

        switch (position) {
            case 'bottom':
                return {
                    ...variants,
                    initial: { ...variants.initial, y: -8, x: '-50%' },
                    animate: { ...variants.animate, y: 0, x: '-50%' },
                    exit: { ...variants.exit, y: -8, x: '-50%' }
                };
            case 'left':
                return {
                    ...variants,
                    initial: { ...variants.initial, x: 8, y: '-50%' },
                    animate: { ...variants.animate, x: -8, y: '-50%' },
                    exit: { ...variants.exit, x: 8, y: '-50%' }
                };
            case 'right':
                return {
                    ...variants,
                    initial: { ...variants.initial, x: -8, y: '-50%' },
                    animate: { ...variants.animate, x: 8, y: '-50%' },
                    exit: { ...variants.exit, x: -8, y: '-50%' }
                };
            case 'top':
            default:
                return {
                    ...variants,
                    initial: { ...variants.initial, y: 8, x: '-50%' },
                    animate: { ...variants.animate, y: 0, x: '-50%' },
                    exit: { ...variants.exit, y: 8, x: '-50%' }
                };
        }
    };

    const getArrowClasses = () => {
        switch (position) {
            case 'top': return 'bottom-[-3px] left-1/2 -translate-x-1/2';
            case 'bottom': return 'top-[-3px] left-1/2 -translate-x-1/2';
            case 'left': return 'right-[-3px] top-1/2 -translate-y-1/2';
            case 'right': return 'left-[-3px] top-1/2 -translate-y-1/2';
            default: return 'bottom-[-3px] left-1/2 -translate-x-1/2';
        }
    };

    const getTransformOrigin = () => {
        switch (position) {
            case 'top': return 'bottom';
            case 'bottom': return 'top';
            case 'left': return 'right';
            case 'right': return 'left';
            default: return 'bottom';
        }
    };

    if (!content) return children;

    return (
        <div
            className="inline-block"
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            {...getAnimationVariants()}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="fixed z-[99999] pointer-events-none"
                            style={{
                                top: coords.top,
                                left: coords.left,
                                transformOrigin: getTransformOrigin()
                            }}
                        >
                            <div className="bg-gray-900/95 dark:bg-cherry/95 text-white text-[11px] leading-none font-medium px-2 py-1.5 rounded shadow-xl border border-white/10 dark:border-cherry-400/20 backdrop-blur-sm whitespace-nowrap">
                                {content}
                                <div className={`absolute w-1.5 h-1.5 bg-gray-900/95 dark:bg-cherry/95 rotate-45 ${getArrowClasses()}`} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Tooltip;
