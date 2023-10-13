import cx from 'classnames';
import { DetailedHTMLProps, FC, TextareaHTMLAttributes, useId } from 'react';

export const TextArea: FC<
  {
    label?: string;
    inputClassName?: string;
    labelClassName?: string;
    error?: string;
  } & DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
> = ({ className, error, label, inputClassName, labelClassName, ...rest }) => {
  const id = useId();

  return (
    <label className={cx(className, 'block')} htmlFor={id}>
      {label && <div className={labelClassName}>{label}</div>}
      <textarea className={cx(inputClassName, 'rounded-md p-2')} id={id} {...rest} />
      {error && <div className="text-xs text-red-500">{error}</div>}
    </label>
  );
};
