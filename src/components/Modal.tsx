import cx from 'classnames';
import { forwardRef, PropsWithChildren, useEffect, useState } from 'react';
import styles from './Modal.module.scss';

export interface ModalProps extends PropsWithChildren {
  className?: string;
  /**
   * Automatically hide children when `open` is falsely
   * Useless if you need to animate or apply logic while closing
   * @default true
   */
  handleChildren?: boolean;
  /**
   * Callback when the user clicks on modal wrapper
   */
  onClose?: () => void;
  /** Modal is open */
  open?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, handleChildren = true, onClose = () => null, open = false }, ref) => {
    const [openState, setOpen] = useState(open);
    useEffect(() => {
      setOpen(open);
    }, [open]);

    if (!open) return null;

    return (
      <div
        className={cx(styles.modal, className, {
          [styles.open]: openState,
        })}
        onClick={(e) => {
          if (e.currentTarget === e.target) setOpen(false);
        }}
        onTransitionEnd={() => {
          if (!openState && open) {
            onClose();
          }
        }}
        ref={ref}
        role="presentation"
      >
        {(open || !handleChildren) && children}
      </div>
    );
  }
);

Modal.displayName = 'modal';
