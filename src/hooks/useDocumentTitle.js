import { useEffect } from 'react';

/**
 * Custom hook to update the document title dynamically
 * @param {string} title - The page title (will be appended with " | LifeCherry")
 * @param {boolean} appendSiteName - Whether to append site name (default: true)
 */
const useDocumentTitle = (title, appendSiteName = true) => {
  useEffect(() => {
    const previousTitle = document.title;
    
    if (title) {
      document.title = appendSiteName ? `${title} | LifeCherry` : title;
    } else {
      document.title = 'LifeCherry - Learn From Life\'s Lessons';
    }

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, appendSiteName]);
};

export default useDocumentTitle;
