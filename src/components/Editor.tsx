import { useTranslation } from 'next-i18next';
import { FC, FormEventHandler, useCallback } from 'react';
import { Button } from './Button';
import styles from './Editor.module.scss';
import { Input } from './Input';
import { usePost } from '@lib/posts';
import { trimTime } from '@utils/date';

export const Editor: FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const { isSaving, post, save, setPost } = usePost(id);

  const formHandler: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      await save();
    },
    [save]
  );

  if (!post) return null;

  console.log(post.created);

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
      <Button className={styles.input} disabled={isSaving} type="primary" submit>
        {t('Save')}
      </Button>
    </form>
  );
};
