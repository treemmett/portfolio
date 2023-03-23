import cx from 'classnames';
import { CSSProperties, FC, MouseEventHandler, PropsWithChildren } from 'react';
import styles from './Button.module.scss';

export type ButtonTypes = 'default' | 'primary';

export interface ButtonProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  inverted?: boolean;
  /** aria label */
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: 'small';
  /** button is of submit type */
  submit?: boolean;
  style?: CSSProperties;
  testId?: string;
  type?: ButtonTypes;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  disabled,
  inverted,
  label,
  onClick,
  size,
  submit,
  style,
  testId,
  type,
}) => (
  <button
    aria-label={label}
    className={cx(styles.button, className, {
      [styles.inverted]: inverted,
      [styles.primary]: type === 'primary',
      [styles.small]: size === 'small',
    })}
    data-testid={testId}
    disabled={disabled}
    onClick={onClick}
    style={style}
    type={submit ? 'submit' : 'button'}
  >
    {children}
  </button>
);
