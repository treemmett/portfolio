import cx from 'classnames';
import {
  DetailedHTMLProps,
  FC,
  FocusEvent,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export interface Option {
  value: string;
  label: string;
}

export const Select: FC<
  {
    label?: string;
    inputClassName?: string;
    labelClassName?: string;
    maxHeight?: number;
    onChange: (value: string) => void;
    options: Option[];
    error?: string;
    value?: string;
  } & Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange'>
> = ({
  className,
  error,
  label,
  inputClassName,
  labelClassName,
  maxHeight: maxHeightProp = 500,
  onChange,
  onBlur,
  onFocus,
  options,
  value: actualValue,
  ...rest
}) => {
  const id = useId();
  const [showDropdown, setShowDropdown] = useState(false);
  const [width, setWidth] = useState(0);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [value, setValue] = useState(options.find((o) => o.value === actualValue)?.label || '');
  useEffect(() => {
    setValue(options.find((o) => o.value === actualValue)?.label || '');
  }, [actualValue, options]);

  const focusHandler = useCallback(
    (e: FocusEvent<HTMLInputElement, Element>) => {
      onFocus?.(e);
      const rect = e.currentTarget.getBoundingClientRect();

      setShowDropdown(true);
      setWidth(rect.width);
      setLeft(rect.left);

      const maxHeightIfBottom = Math.min(
        maxHeightProp,
        window.innerHeight - rect.height - rect.y - 8 - 8,
      );
      if (maxHeightIfBottom < 200) {
        setBottom(window.innerHeight - rect.top + 8);
        setMaxHeight(Math.min(maxHeightProp, rect.top - 16));
      } else {
        setTop(rect.y + rect.height + 8);
        setMaxHeight(maxHeightIfBottom);
      }
    },
    [maxHeightProp, onFocus],
  );

  const blurHandler = useCallback(
    (e: FocusEvent<HTMLInputElement, Element>) => {
      onBlur?.(e);
      setShowDropdown(false);
      setWidth(0);
      setLeft(0);
      setTop(0);
      setBottom(0);
      setMaxHeight(0);
    },
    [onBlur],
  );

  const filteredOptions = useMemo(
    () =>
      value
        ? options.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()))
        : options,
    [options, value],
  );

  const selectHandler = useCallback(
    (option: Option) => {
      setShowDropdown(false);
      setWidth(0);
      setLeft(0);
      setTop(0);
      setBottom(0);
      setMaxHeight(0);
      onChange(option.value);
    },
    [onChange],
  );

  return (
    <label className={cx(className, 'block rounded-md')} htmlFor={id}>
      {label && <div className={labelClassName}>{label}</div>}
      <input
        className={cx(inputClassName, 'block w-full rounded-md p-2')}
        id={id}
        {...rest}
        onBlur={blurHandler}
        onChange={(e) => setValue(e.currentTarget.value)}
        onFocus={focusHandler}
        value={value}
      />
      {error && <div className="text-xs text-red-500">{error}</div>}
      {showDropdown &&
        createPortal(
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className="glass fixed z-20 flex flex-col gap-2 overflow-auto rounded-md p-2"
            onMouseDown={(e) => e.preventDefault()}
            style={{ bottom: bottom || undefined, left, maxHeight, top: top || undefined, width }}
          >
            {filteredOptions.map((option) => (
              <button className="button" key={option.value} onClick={() => selectHandler(option)}>
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </label>
  );
};
