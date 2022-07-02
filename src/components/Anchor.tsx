import cx from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { ButtonTypes } from './Button';
import styles from './Button.module.scss';

export interface AnchorProps extends PropsWithChildren {
  className?: string;
  /** emulate button design */
  button?: boolean;
  href: string;
  type?: ButtonTypes;
}

export const Anchor: FC<AnchorProps> = ({ className, children, button, href, type }) => (
  <a
    className={cx(className, {
      [styles.primary]: button && type === 'primary',
      [styles.button]: button,
    })}
    href={href}
    rel="noreferrer"
    target="_blank"
  >
    {children}
  </a>
);
