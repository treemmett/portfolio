import cx from 'classnames';
import { forwardRef, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import styles from './Modal.module.scss';

export interface ModalProps extends PropsWithChildren {
  /**
   * Whether clicking outside the modal triggers the closing callback
   * @default true
   */
  canClose?: boolean;
  className?: string;
  /**
   * Callback when modal finishes closing
   */
  onClose?: () => void;
  /** Modal is open */
  open?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ canClose = true, className, children, onClose = () => null, open = false }, ref) => {
    const [openState, setOpen] = useState(open);
    useEffect(() => {
      setOpen(open);
    }, [open]);

    const keyboardHandler = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }, []);

    useEffect(() => {
      if (open) {
        window.addEventListener('keydown', keyboardHandler);
      }

      return () => window.addEventListener('keydown', keyboardHandler);
    }, [keyboardHandler, open]);

    if (!open) return null;

    return (
      <div
        className={cx(styles.modal, className, {
          [styles.open]: openState,
        })}
        onClick={(e) => {
          if (e.currentTarget === e.target && canClose) setOpen(false);
        }}
        onTransitionEnd={() => {
          if (!openState && open) {
            onClose();
          }
        }}
        ref={ref}
        role="presentation"
      >
        {children}
      </div>
    );
  }
);

Modal.displayName = 'modal';
