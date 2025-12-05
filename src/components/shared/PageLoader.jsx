// Page Wrapper with Loading State - Shows loader for minimum 1 second
import React, { useState, useEffect } from 'react';
import Loading from './Loading';

const PageLoader = ({ children, minLoadTime = 1000 }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default PageLoader;
