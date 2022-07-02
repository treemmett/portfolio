import cx from 'classnames';
import { FC, MouseEventHandler, PropsWithChildren } from 'react';
import styles from './Button.module.scss';

export type ButtonTypes = 'default' | 'primary' | 'fab';

export interface ButtonProps extends PropsWithChildren {
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
    className={cx(styles.button, className, {
      [styles.fab]: type === 'fab',
      [styles.primary]: type === 'primary',
    })}
    disabled={disabled}
    onClick={onClick}
    type={submit ? 'submit' : 'button'}
  >
    {children}
  </button>
);
