import cx from 'classnames';
import { ChangeEventHandler, FC, HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { ReactComponent as Check } from '../icons/check.svg';
import styles from './Input.module.scss';
import type { IPhoto } from '@entities/Photo';

export interface InputProps {
  /** className passed to wrapper */
  className?: string;
  checked?: boolean;
  /** remove spacing reserved for label */
  collapseLabel?: boolean;
  defaultValue?: string;
  file?: File | IPhoto | null;
  id?: string;
  label?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  options?: { id: string; label: string }[];
  step?: number;
  testId?: string;
  type?: HTMLInputTypeAttribute | 'select' | 'textarea';
  value?: string | number;
}

function randomId() {
  return `input-${Math.random().toString().substring(2, 8)}`;
}

export const Input: FC<InputProps> = ({
  className,
  checked,
  collapseLabel,
  defaultValue,
  file,
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
          {label}
        </label>
      )}
      {type === 'select' && (
        <select className={styles.input} id={realId} name={name} onChange={onChange} value={value}>
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
          id={realId}
          name={name}
          onChange={onChange}
          value={value}
        />
      )}
      {type === 'file' && (
        <div className={cx(styles.input, styles.file)}>
          <input accept="image/*" id={realId} onChange={onChange} type="file" />
          {imageData && <img alt="Logo" src={imageData} />}
        </div>
      )}
      {type === 'checkbox' && (
        <div className={cx(styles.input, styles.checkbox)}>
          <input checked={checked} id={realId} name={name} onChange={onChange} type="checkbox" />
          <Check />
        </div>
      )}
      {(!type || !['checkbox', 'file', 'select', 'textarea'].includes(type)) && (
        <input
          className={styles.input}
          data-testid={testId}
          defaultValue={defaultValue}
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
