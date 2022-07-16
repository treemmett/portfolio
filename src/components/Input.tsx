import cx from 'classnames';
import { ChangeEventHandler, FC, HTMLInputTypeAttribute, useEffect, useState } from 'react';
import styles from './Input.module.scss';

export interface InputProps {
  /** className passed to wrapper */
  className?: string;
  /** remove spacing reserved for label */
  collapseLabel?: boolean;
  defaultValue?: string;
  id?: string;
  label?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  testId?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
}

function randomId() {
  return `input-${Math.random().toString().substring(2, 8)}`;
}

export const Input: FC<InputProps> = ({
  className,
  collapseLabel,
  defaultValue,
  id,
  label,
  name,
  onChange,
  testId,
  type,
  value,
}) => {
  const [realId, setRealId] = useState(id);
  useEffect(() => setRealId(id || randomId()), [id]);

  return (
    <label className={cx(styles.wrapper, className)} htmlFor={realId}>
      {(!collapseLabel || label) && <div className={styles.label}>{label}</div>}
      <input
        className={styles.input}
        data-testid={testId}
        defaultValue={defaultValue}
        id={realId}
        name={name}
        onChange={onChange}
        type={type}
        value={value}
      />
    </label>
  );
};
