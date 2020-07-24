import { useState, useEffect } from 'react';

export function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  function handleResize() {
    setWindowSize(getSize());
  }

  useResize(handleResize);

  return windowSize;
}

export function useResize(func) {
  const isClient = typeof window === 'object';

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    window.addEventListener('resize', func);
    return () => window.removeEventListener('resize', func);
  }, []);

  return undefined;
}

// export default useWindowSize;
