import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoThumbsUp, IoThumbsUpOutline,
    IoHeart, IoHeartOutline,
    IoHappy, IoHappyOutline,
    IoAlertCircle, IoAlertCircleOutline,
    IoSad, IoSadOutline,
    IoFlame, IoFlameOutline,
    IoAddCircleOutline
} from 'react-icons/io5';

const REACTION_CONFIG = {
    '👍': { icon: IoThumbsUp, outline: IoThumbsUpOutline, color: 'text-blue-500', label: 'Like' },
    '❤️': { icon: IoHeart, outline: IoHeartOutline, color: 'text-rose-500', label: 'Love' },
    '😂': { icon: IoHappy, outline: IoHappyOutline, color: 'text-amber-500', label: 'Haha' },
    '😮': { icon: IoAlertCircle, outline: IoAlertCircleOutline, color: 'text-orange-500', label: 'Wow' },
    '😢': { icon: IoSad, outline: IoSadOutline, color: 'text-sky-500', label: 'Sad' },
    '😡': { icon: IoFlame, outline: IoFlameOutline, color: 'text-red-500', label: 'Angry' },
};

const REACTION_EMOJIS = Object.keys(REACTION_CONFIG);

export default function ReactionBar({ reactions, userReaction, onReact }) {
    const [showPicker, setShowPicker] = useState(false);

    // Group reactions by emoji type
    const reactionGroups = REACTION_EMOJIS.map(emoji => {
        const count = reactions?.filter(r => r.emoji === emoji).length || 0;
        const isActive = userReaction?.emoji === emoji;
        return { emoji, count, isActive, ...REACTION_CONFIG[emoji] };
    }).filter(group => group.count > 0);

    return (
        <div className="flex items-center gap-2 flex-wrap relative z-10">
            {/* Existing Reactions - Staggered Animation */}
            <div className="flex items-center gap-2">
                <AnimatePresence mode='popLayout'>
                    {reactionGroups.map((group) => (
                        <motion.button
                            layout
                            key={group.emoji}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onReact(group.emoji)}
                            className={`
                group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                border transition-colors duration-300
                ${group.isActive
                                    ? `${group.color} bg-white dark:bg-gray-800 border-current shadow-sm`
                                    : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }
              `}
                        >
                            {group.isActive ? (
                                <group.icon className="text-lg" />
                            ) : (
                                <group.outline className="text-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                            )}

                            <span className={`text-xs font-semibold ${group.isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {group.count}
                            </span>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Reaction Button */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPicker(!showPicker)}
                    className={`
            flex items-center justify-center w-8 h-8 rounded-full 
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
            bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 
            transition-colors
            ${userReaction ? 'text-cherry' : ''}
          `}
                >
                    <IoAddCircleOutline className="text-xl" />
                </motion.button>

                {/* Floating Picker */}
                <AnimatePresence>
                    {showPicker && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute left-0 bottom-full mb-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex gap-1 z-50"
                        >
                            {REACTION_EMOJIS.map((emoji, index) => {
                                const config = REACTION_CONFIG[emoji];
                                const Icon = userReaction?.emoji === emoji ? config.icon : config.outline;

                                return (
                                    <motion.button
                                        key={emoji}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: { delay: index * 0.05 }
                                        }}
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        onClick={() => {
                                            onReact(emoji);
                                            setShowPicker(false);
                                        }}
                                        className={`
                      w-8 h-8 flex items-center justify-center rounded-full 
                      transition-colors text-xl
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      ${userReaction?.emoji === emoji ? config.color : 'text-gray-500 dark:text-gray-400'}
                    `}
                                        title={config.label}
                                    >
                                        <Icon />
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
