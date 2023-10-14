import cx from 'classnames';
import { DetailedHTMLProps, FC, InputHTMLAttributes, useId } from 'react';
import { Check } from 'react-feather';

export const CheckBox: FC<
  {
    label?: string;
    labelClassName?: string;
    error?: string;
  } & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({ className, error, label, labelClassName, ...rest }) => {
  const id = useId();

  return (
    <label className={cx(className, 'block rounded-md')} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input className="peer hidden" id={id} type="checkbox" {...rest} />
        <div className="button flex h-8 w-8 items-center justify-center peer-checked:[&>svg]:block">
          <Check className="hidden peer-checked:block" />
        </div>
        {label && <div className={labelClassName}>{label}</div>}
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </label>
  );
};
