import { FC, FormEventHandler, useCallback, useEffect, useState } from 'react';
import styles from './Editor.module.scss';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { usePost } from '@lib/posts';
import { useUser } from '@lib/user';
import { trimTime } from '@utils/date';
import { useTranslation } from '@utils/translation';

export const Editor: FC<{ id: string; setIsMutating: (isMutating: boolean) => void }> = ({
  id,
  setIsMutating,
}) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isDeleting, isMutating, isSaving, post, save, setPost, deleteTrigger } = usePost(id);
  const { hasPermission, user } = useUser();

  useEffect(() => {
    setIsMutating(!isMutating);
  }, [isMutating, setIsMutating]);

  const formHandler: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      await save();
    },
    [save],
  );

  if (!post || !user) return null;
  if (post.owner.id !== user.id) return null;

  return (
    <form className={styles.form} onSubmit={formHandler}>
      <Input
        className={styles.input}
        label={t('Title')}
        name="title"
        onChange={(e) => setPost({ ...post, title: e.currentTarget.value })}
        value={post.title || ''}
      />
      <Input
        className={styles.input}
        label={t('Location')}
        name="location"
        onChange={(e) => setPost({ ...post, location: e.currentTarget.value })}
        value={post.location || ''}
      />
      <Input
        className={styles.input}
        label={t('Date')}
        name="date"
        onChange={(e) => setPost({ ...post, created: new Date(e.currentTarget.value) })}
        type="date"
        value={trimTime(post.created) || ''}
      />
      <Button className={styles.input} disabled={isMutating} type="success" submit>
        {isSaving ? `${t('Saving')}...` : t('Save')}
      </Button>
      {hasPermission(AuthorizationScopes.delete) && (
        <Button
          className={styles.input}
          disabled={isMutating}
          onClick={() => setShowDeleteConfirm(true)}
          type="danger"
        >
          {t('Delete')}
        </Button>
      )}
      <Modal
        canClose={!isMutating}
        onClose={() => setShowDeleteConfirm(false)}
        open={showDeleteConfirm}
      >
        <Button disabled={isMutating} onClick={() => setShowDeleteConfirm(false)}>
          {t('Go back')}
        </Button>
        <Button disabled={isMutating} onClick={() => deleteTrigger()} type="danger">
          {isDeleting ? `${t('Deleting')}...` : t('Delete')}
        </Button>
      </Modal>
    </form>
  );
};
