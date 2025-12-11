// SectionHeader - Reusable component for section headings
import React from 'react';

/**
 * A reusable section header component with consistent styling.
 * @param {string} title - The main heading text
 * @param {string} subtitle - The description text below the heading
 * @param {boolean} centered - Whether to center align the header (default: true)
 * @param {string} className - Additional classes for the container
 */
const SectionHeader = ({ title, subtitle, centered = true, className = '' }) => {
    return (
        <div className={`${centered ? 'text-center' : ''} mb-8 md:mb-16 ${className}`}>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="text-text-secondary dark:text-gray-400 mt-2 md:mt-4 max-w-xl mx-auto text-base md:text-lg">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default SectionHeader;
