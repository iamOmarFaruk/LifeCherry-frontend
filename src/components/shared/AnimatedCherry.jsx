import { motion } from 'framer-motion';

const AnimatedCherry = ({ className = "" }) => {
    return (
        <motion.span
            className={`inline-block origin-center ${className}`}
            animate={{
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            🍒
        </motion.span>
    );
};

export default AnimatedCherry;
