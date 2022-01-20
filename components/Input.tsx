import { ChangeEventHandler, FC, useEffect, useState } from 'react';
import cx from 'classnames';
import styles from './Input.module.scss';

export interface InputProps {
  /** className passed to wrapper */
  className?: string;
  /** remove spacing reserved for label */
  collapseLabel?: boolean;
  id?: string;
  label?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string;
}

function randomId() {
  return `input-${Math.random().toString().substring(2, 8)}`;
}

export const Input: FC<InputProps> = ({ className, collapseLabel, id, label, onChange, value }) => {
  const [realId, setRealId] = useState(id);
  useEffect(() => setRealId(id || randomId()), [id]);

  return (
    <label className={cx(styles.wrapper, className)} htmlFor={realId}>
      {(!collapseLabel || label) && <div className={styles.label}>{label}</div>}
      <input className={styles.input} id={realId} onChange={onChange} value={value} />
    </label>
  );
};
