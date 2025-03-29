import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    // Call once on mount to ensure initial size is correct
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array—only runs on mount/unmount

  return windowSize;
}

export default useWindowSize;
