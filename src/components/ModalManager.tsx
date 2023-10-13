'use client';

import cx from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { v4 } from 'uuid';
import { Modal } from './Modal';
import { useTranslation } from '@utils/translation';

interface ConfirmModalEvent {
  cancelClassName?: string;
  cancelText?: string;
  confirmClassName?: string;
  confirmText?: string;
  id: string;
  message: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const ModalManager: FC = () => {
  const { t } = useTranslation();
  const [modals, setModals] = useState<ConfirmModalEvent[]>([]);
  const handler: EventListener = useCallback((e: CustomEventInit<ConfirmModalEvent>) => {
    if (!e.detail) return;

    const { detail } = e;
    setModals((m) => [...m, detail]);
  }, []);
  useEffect(() => {
    window.addEventListener('openConfirmModal', handler);
    return () => {
      window.removeEventListener('openConfirmModal', handler);
    };
  }, [handler]);

  const closeModal = useCallback(
    (id: string, ignoreCallback?: boolean) => {
      const modal = modals.find((m) => m.id === id);
      if (!ignoreCallback && modal?.onCancel) {
        modal.onCancel();
      }
      setModals((m) => m.filter((n) => n.id !== id));
    },
    [modals],
  );

  if (typeof window === 'undefined') return null;

  return (
    <>
      {modals.map((modal) =>
        createPortal(
          <Modal onClose={() => closeModal(modal.id)} open>
            <div className="glass mx-auto w-full max-w-xl rounded-md p-4 drop-shadow-lg">
              <div className="text-center text-lg">{modal.message}</div>
              <div className="mt-8 flex gap-2">
                <button
                  className={cx('button flex-1', modal.confirmClassName)}
                  onClick={() => {
                    modal.onConfirm?.();
                    closeModal(modal.id, true);
                  }}
                >
                  {modal.confirmText || t('Confirm')}
                </button>
                <button
                  className={cx('button flex-1', modal.cancelClassName)}
                  onClick={() => closeModal(modal.id)}
                >
                  {modal.cancelText || t('Cancel')}
                </button>
              </div>
            </div>
          </Modal>,
          document.body,
        ),
      )}
    </>
  );
};

export function openConfirmModal(detail: Omit<ConfirmModalEvent, 'id'>) {
  const id = v4();
  const event = new CustomEvent<ConfirmModalEvent>('openConfirmModal', {
    detail: { ...detail, id },
  });
  window.dispatchEvent(event);
  return id;
}
