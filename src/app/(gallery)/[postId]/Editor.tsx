import { useForm } from '@mantine/form';
import { Post } from '@prisma/client';
import { FC, useState } from 'react';
import styles from './Editor.module.scss';
import { updatePost } from './actions';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const Editor: FC<{ post: Post }> = ({ post }) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { hasPermission } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    initialValues: {
      created: post.created || '',
      location: post.location || '',
      title: post.title || '',
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={form.onSubmit(async (values) => {
        try {
          setIsSaving(true);
          await updatePost(post.id, values);
        } finally {
          setIsSaving(false);
        }
      })}
    >
      <Input
        className={styles.input}
        label={t('Title')}
        name="title"
        {...form.getInputProps('title')}
      />
      <Input
        className={styles.input}
        label={t('Location')}
        name="location"
        {...form.getInputProps('location')}
      />
      <Input
        className={styles.input}
        label={t('Date')}
        name="date"
        type="date"
        {...form.getInputProps('created')}
      />
      <Button className={styles.input} disabled={isSaving} type="success" submit>
        {isSaving ? `${t('Saving')}...` : t('Save')}
      </Button>
      {hasPermission(AuthorizationScopes.delete) && (
        <Button
          className={styles.input}
          disabled={isSaving}
          onClick={() => setShowDeleteConfirm(true)}
          type="danger"
        >
          {t('Delete')}
        </Button>
      )}
      <Modal
        canClose={!isSaving}
        onClose={() => setShowDeleteConfirm(false)}
        open={showDeleteConfirm}
      >
        <Button disabled={isSaving} onClick={() => setShowDeleteConfirm(false)}>
          {t('Go back')}
        </Button>
        <Button disabled={isSaving} type="danger">
          {isSaving ? `${t('Deleting')}...` : t('Delete')}
        </Button>
      </Modal>
    </form>
  );
};
