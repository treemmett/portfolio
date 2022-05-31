import cx from 'classnames';
import { FC } from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: FC<ButtonProps> = ({ children, className, disabled, type = 'button' }) => (
  <button className={cx(styles.button, className)} disabled={disabled} type={type}>
    {children}
  </button>
);
