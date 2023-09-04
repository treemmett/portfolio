'use client';

import { FC, useEffect } from 'react';

export const ScrollLock: FC = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, []);

  return null;
};
