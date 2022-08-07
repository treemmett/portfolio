import cx from 'classnames';
import { FC, MouseEventHandler, PropsWithChildren } from 'react';
import styles from './Button.module.scss';

export type ButtonTypes = 'default' | 'primary';

export interface ButtonProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  /** aria label */
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: 'small';
  /** button is of submit type */
  submit?: boolean;
  testId?: string;
  type?: ButtonTypes;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  disabled,
  label,
  onClick,
  size,
  submit,
  testId,
  type,
}) => (
  <button
    aria-label={label}
    className={cx(styles.button, className, {
      [styles.primary]: type === 'primary',
      [styles.small]: size === 'small',
    })}
    data-testid={testId}
    disabled={disabled}
    onClick={onClick}
    type={submit ? 'submit' : 'button'}
  >
    {children}
  </button>
);
