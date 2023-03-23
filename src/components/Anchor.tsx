import cx from 'classnames';
import { FC, PropsWithChildren } from 'react';
import styles from './Button.module.scss';
import { trace } from '@utils/analytics';

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
    onClick={() => {
      trace('external-link-click', {
        href,
      });
    }}
    rel="noreferrer"
    target="_blank"
  >
    {children}
  </a>
);
