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
  /**
   * Callback when modal is rendered
   */
  onReady?: () => void;
  /** Modal is open */
  open?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ canClose = true, className, children, onClose = () => null, onReady, open = false }, ref) => {
    const [rendered, setRendered] = useState(open);
    const [openState, setOpen] = useState(open);
    useEffect(() => {
      if (open && onReady) {
        setTimeout(onReady, 1);
      }
    }, [onReady, open]);

    useEffect(() => {
      if (open) {
        setRendered(true);
      } else {
        setOpen(false);
      }
    }, [open]);

    useEffect(() => {
      if (rendered) {
        setTimeout(setOpen, 1, true);
      }
    }, [rendered]);

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

    if (!rendered) return null;

    return (
      <div
        className={cx(styles.modal, className, {
          [styles.open]: openState,
        })}
        onClick={(e) => {
          if (e.currentTarget === e.target && canClose) setOpen(false);
        }}
        onTransitionEnd={(e) => {
          if (e.currentTarget !== e.target) return;

          if (!openState) {
            onClose();
            setRendered(false);
          }
        }}
        ref={ref}
        role="presentation"
      >
        {children}
      </div>
    );
  },
);

Modal.displayName = 'modal';
