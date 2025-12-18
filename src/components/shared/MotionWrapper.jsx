import React, { useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

const variants = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    fadeInUp: {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    },
    fadeInLeft: {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 }
    },
    fadeInRight: {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0 }
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    },
    staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }
};

const MotionWrapper = ({
    children,
    variant = 'fadeInUp',
    delay = 0,
    duration = 0.5,
    className = '',
    once = true,
    amount = 0.2,
    ...props
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        } else if (!once) {
            controls.start('hidden');
        }
    }, [isInView, controls, once]);

    return (
        <motion.div
            ref={ref}
            variants={variants[variant] || variants.fadeInUp}
            initial="hidden"
            animate={controls}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default MotionWrapper;
