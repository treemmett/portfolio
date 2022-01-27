import cx from 'classnames';
import { FC } from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: FC<ButtonProps> = ({ children, className, type = 'button' }) => (
  <button className={cx(styles.button, className)} type={type}>
    {children}
  </button>
);
