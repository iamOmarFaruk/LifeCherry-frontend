// Dashboard Page Header Component - Reusable header for all dashboard pages
import React from 'react';

/**
 * DashboardPageHeader - A reusable page header component for dashboard pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - The icon component to display (e.g., HiOutlineUser)
 * @param {string} props.title - The page title
 * @param {string} props.description - The page description/subtitle
 * @param {React.ReactNode} props.children - Optional children (e.g., action buttons)
 */
const DashboardPageHeader = ({ icon: Icon, title, description, children }) => {
    return (
        <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-4xl font-bold text-cherry mb-2 flex items-center gap-2 lg:gap-3">
                        {Icon && <Icon className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0" />}
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-3">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPageHeader;
