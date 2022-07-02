import cx from 'classnames';
import { forwardRef, PropsWithChildren } from 'react';
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
  ({ className, children, handleChildren = true, onClose = () => null, open = false }, ref) => (
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
      {(open || !handleChildren) && children}
    </div>
  )
);
