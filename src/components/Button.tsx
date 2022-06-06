import cx from 'classnames';
import { FC } from 'react';
import styles from './Button.module.scss';

export type ButtonTypes = 'default' | 'primary';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  /** button is of submit type */
  submit?: boolean;
  type?: ButtonTypes;
}

export const Button: FC<ButtonProps> = ({ children, className, disabled, submit, type }) => (
  <button
    className={cx(styles.button, className, { [styles.primary]: type === 'primary' })}
    disabled={disabled}
    type={submit ? 'submit' : 'button'}
  >
    {children}
  </button>
);
