import { useState, useEffect } from 'react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    // Add the listener
    media.addEventListener('change', listener);
    
    // Check on mount in case the value changed between initial state and effect
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);

  return matches;
};

export default useMediaQuery;