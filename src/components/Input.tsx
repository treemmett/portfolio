import cx from 'classnames';
import {
  ChangeEventHandler,
  DetailedHTMLProps,
  FC,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  useEffect,
  useState,
} from 'react';
import { ReactComponent as Check } from '../icons/check.svg';
import styles from './Input.module.scss';
import type { IPhoto } from '@entities/Photo';

export interface InputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  /** remove spacing reserved for label */
  collapseLabel?: boolean;
  file?: File | IPhoto | null;
  helperText?: string;
  label?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  options?: { id: string; label: string }[];
  testId?: string;
  type?: HTMLInputTypeAttribute | 'select' | 'textarea';
}

function randomId() {
  return `input-${Math.random().toString().substring(2, 8)}`;
}

export const Input: FC<InputProps> = ({
  className,
  checked,
  collapseLabel,
  defaultValue,
  disabled,
  file,
  helperText,
  id,
  label,
  name,
  onChange,
  options,
  step,
  testId,
  type,
  value,
}) => {
  const [realId, setRealId] = useState(id);
  useEffect(() => setRealId(id || randomId()), [id]);

  const [imageData, setImageData] = useState<string>();
  useEffect(() => {
    if (!file) return;

    if (file instanceof File) {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        setImageData(reader.result as string);
      });

      reader.readAsDataURL(file);
    }

    if ('url' in file) {
      setImageData(file.url);
    }
  }, [file]);

  return (
    <label
      className={cx(styles.wrapper, className, { [styles.inline]: type === 'checkbox' })}
      htmlFor={realId}
    >
      {(!collapseLabel || label) && (
        <label className={styles.label} htmlFor={realId}>
          {helperText || label}
        </label>
      )}
      {type === 'select' && (
        <select
          className={styles.input}
          disabled={disabled}
          id={realId}
          name={name}
          onChange={onChange}
          value={value}
        >
          {options?.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {type === 'textarea' && (
        <textarea
          className={styles.input}
          disabled={disabled}
          id={realId}
          name={name}
          onChange={onChange}
          value={value}
        />
      )}
      {type === 'file' && (
        <div className={cx(styles.input, styles.file)}>
          <input accept="image/*" disabled={disabled} id={realId} onChange={onChange} type="file" />
          {imageData && <img alt="Logo" src={imageData} />}
        </div>
      )}
      {type === 'checkbox' && (
        <div className={cx(styles.input, styles.checkbox)}>
          <input
            checked={checked}
            disabled={disabled}
            id={realId}
            name={name}
            onChange={onChange}
            type="checkbox"
          />
          <Check />
        </div>
      )}
      {(!type || !['checkbox', 'file', 'select', 'textarea'].includes(type)) && (
        <input
          className={styles.input}
          data-testid={testId}
          defaultValue={defaultValue}
          disabled={disabled}
          id={realId}
          name={name}
          onChange={onChange}
          step={step}
          type={type}
          value={value}
        />
      )}
    </label>
  );
};
