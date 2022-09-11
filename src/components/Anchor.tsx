import cx from 'classnames';
import { track } from 'insights-js';
import { FC, PropsWithChildren } from 'react';
import { ButtonTypes } from './Button';
import styles from './Button.module.scss';

export interface AnchorProps extends PropsWithChildren {
  className?: string;
  /** emulate button design */
  button?: boolean;
  href: string;
  /** aria label */
  label?: string;
  type?: ButtonTypes;
}

export const Anchor: FC<AnchorProps> = ({ className, children, button, href, label, type }) => (
  <a
    aria-label={label}
    className={cx(className, {
      [styles.primary]: button && type === 'primary',
      [styles.button]: button,
    })}
    href={href}
    onClick={() => {
      track({
        id: 'external-link-click',
        parameters: {
          href,
        },
      });
    }}
    rel="noreferrer"
    target="_blank"
  >
    {children}
  </a>
);
