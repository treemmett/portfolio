import cx from 'classnames';
import { FC } from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  /** button is of submit type */
  submit?: boolean;
}

export const Button: FC<ButtonProps> = ({ children, className, disabled, submit }) => (
  <button
    className={cx(styles.button, className)}
    disabled={disabled}
    type={submit ? 'submit' : 'button'}
  >
    {children}
  </button>
);
