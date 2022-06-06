import cx from 'classnames';
import { FC, MouseEventHandler } from 'react';
import styles from './Button.module.scss';

export type ButtonTypes = 'default' | 'primary';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** button is of submit type */
  submit?: boolean;
  type?: ButtonTypes;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  disabled,
  onClick,
  submit,
  type,
}) => (
  <button
    className={cx(styles.button, className, { [styles.primary]: type === 'primary' })}
    disabled={disabled}
    onClick={onClick}
    type={submit ? 'submit' : 'button'}
  >
    {children}
  </button>
);
