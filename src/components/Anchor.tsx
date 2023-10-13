'use client';

import { FC, PropsWithChildren } from 'react';

export interface AnchorProps extends PropsWithChildren {
  className?: string;
  /** emulate button design */
  href?: string;
  /** aria label */
  label?: string;
}

export const Anchor: FC<AnchorProps> = ({ className, children, href, label }) => (
  <a aria-label={label} className={className} href={href} rel="noreferrer" target="_blank">
    {children}
  </a>
);
