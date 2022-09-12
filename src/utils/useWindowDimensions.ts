import { useCallback, useEffect, useState } from 'react';

export function useWindowDimensions(): [width: number, height: number] {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const getDimensions = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    getDimensions();
    window.addEventListener('resize', getDimensions);
    return () => window.removeEventListener('resize', getDimensions);
  }, [getDimensions]);

  return [width, height];
}
