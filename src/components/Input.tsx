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
    <label className={cx(className, 'block rounded-md')} htmlFor={id}>
      {label && <div className={labelClassName}>{label}</div>}
      <input className={cx(inputClassName, 'block w-full rounded-md p-2')} id={id} {...rest} />
      {error && <div className="text-xs text-red-500">{error}</div>}
    </label>
  );
};
