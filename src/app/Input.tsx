import cx from 'classnames';
import { DetailedHTMLProps, FC, InputHTMLAttributes, useId } from 'react';

export const Input: FC<
  {
    label?: string;
    inputClassName?: string;
    labelClassName?: string;
    error?: string;
  } & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({ className, error, label, inputClassName, labelClassName, ...rest }) => {
  const id = useId();

  return (
    <label className={cx(className, 'block')} htmlFor={id}>
      {label && <div className={labelClassName}>{label}</div>}
      <input
        className={inputClassName}
        id={id}
        placeholder="https://raw.github.com/..."
        {...rest}
      />
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </label>
  );
};
