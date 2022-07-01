import cx from 'classnames';
import { forwardRef, PropsWithChildren } from 'react';
import styles from './Modal.module.scss';

export interface ModalProps {
  className?: string;
  /** Callback when the user clicks on modal wrapper */
  onClose?: () => void;
  /** Modal is open */
  open?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, PropsWithChildren<ModalProps>>(
  ({ className, children, onClose = () => null, open = false }, ref) => (
    <div
      className={cx(styles['light-box'], className, {
        [styles.open]: open,
      })}
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
      ref={ref}
      role="presentation"
    >
      {children}
    </div>
  )
);
