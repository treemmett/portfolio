import { useTranslation } from 'next-i18next';
import { FC, FormEventHandler, useCallback, useState } from 'react';
import { Button } from './Button';
import styles from './Editor.module.scss';
import { Input } from './Input';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { usePost } from '@lib/posts';
import { useSession } from '@lib/session';
import { trimTime } from '@utils/date';

export const Editor: FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isDeleting, isSaving, post, save, setPost, deleteTrigger } = usePost(id);
  const { hasPermission } = useSession();

  const formHandler: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      await save();
    },
    [save]
  );

  if (!post) return null;

  return (
    <form className={styles.form} onSubmit={formHandler}>
      <Input
        className={styles.input}
        label={t('Title')}
        name="title"
        onChange={(e) => setPost({ ...post, title: e.currentTarget.value })}
        value={post.title}
      />
      <Input
        className={styles.input}
        label={t('Location')}
        name="location"
        onChange={(e) => setPost({ ...post, location: e.currentTarget.value })}
        value={post.location}
      />
      <Input
        className={styles.input}
        label={t('Date')}
        name="date"
        onChange={(e) => setPost({ ...post, created: e.currentTarget.value })}
        type="date"
        value={trimTime(post.created)}
      />
      <Button className={styles.input} disabled={isSaving} type="success" submit>
        {t('Save')}
      </Button>
      {hasPermission(AuthorizationScopes.delete) && (
        <Button
          className={styles.input}
          disabled={isDeleting}
          onClick={() => setShowDeleteConfirm(true)}
          type="danger"
        >
          {t('Delete')}
        </Button>
      )}
      <Modal
        handleChildren={false}
        onClose={() => setShowDeleteConfirm(false)}
        open={showDeleteConfirm}
      >
        <Button onClick={() => setShowDeleteConfirm(false)}>{t('Go back')}</Button>
        <Button disabled={isDeleting} onClick={() => deleteTrigger()} type="danger">
          {isDeleting ? t('Deleting...') : t('Delete')}
        </Button>
      </Modal>
    </form>
  );
};
