'use client';

import { useForm } from '@mantine/form';
import { Post } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { deletePost, updatePost } from '../actions';
import styles from './Editor.module.scss';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { useTranslation } from '@utils/translation';

export const Editor: FC<{ post: Post }> = ({ post }) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { push } = useRouter();

  const form = useForm({
    initialValues: {
      created: post.created || '',
      location: post.location || '',
      title: post.title || '',
    },
  });

  const deleteCallback = useCallback(async () => {
    try {
      setIsSaving(true);
      await deletePost(post.id);
      push('/');
    } catch {
      setIsSaving(false);
    }
  }, [post.id, push]);

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
      <button className="button mt-3 w-full bg-green-700/50" disabled={isSaving} type="submit">
        {isSaving ? `${t('Saving')}...` : t('Save')}
      </button>
      <button
        className="button mt-3 w-full bg-red-800/50"
        disabled={isSaving}
        onClick={() => setShowDeleteConfirm(true)}
      >
        {t('Delete')}
      </button>
      <Link className="button block mt-3 w-full" href={`/${post.id}`}>
        Cancel
      </Link>
      <Modal
        canClose={!isSaving}
        onClose={() => setShowDeleteConfirm(false)}
        open={showDeleteConfirm}
      >
        <button
          className="button w-full"
          disabled={isSaving}
          onClick={() => setShowDeleteConfirm(false)}
        >
          {t('Go back')}
        </button>
        <button
          className="button mt-3 w-full bg-red-800/50"
          disabled={isSaving}
          onClick={deleteCallback}
        >
          {isSaving ? `${t('Deleting')}...` : t('Delete')}
        </button>
      </Modal>
    </form>
  );
};
