'use client';

import cx from 'classnames';
import { FC, PropsWithChildren } from 'react';
import styles from './Button.module.scss';

export interface AnchorProps extends PropsWithChildren {
  className?: string;
  /** emulate button design */
  button?: boolean;
  href?: string;
  /** aria label */
  label?: string;
}

export const Anchor: FC<AnchorProps> = ({ className, children, button, href, label }) => (
  <a
    aria-label={label}
    className={cx(className, {
      [styles.button]: button,
    })}
    href={href}
    rel="noreferrer"
    target="_blank"
  >
    {children}
  </a>
);
