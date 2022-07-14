import cx from 'classnames';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ChangeEventHandler, FC, FormEventHandler, useCallback, useRef, useState } from 'react';
import type { Post } from '../entities/Post';
import { Button } from './Button';
import { useDataStore } from './DataStore';
import styles from './Editor.module.scss';
import { Input } from './Input';
import { Modal } from './Modal';

enum UploadState {
  default,
  uploading,
}

export const Editor: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { apiClient } = useDataStore();
  const [imageData, setImageData] = useState('');
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const file = e.currentTarget.files[0];
    if (!file) {
      setImageData('');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageData(reader.result.toString());
    });
    reader.readAsDataURL(file);
  }, []);

  const formRef = useRef<HTMLFormElement>();
  const closeEditor = useCallback(() => {
    if (formRef.current) {
      formRef.current.reset();
    }

    router.push({ query: { newPost: undefined } }, undefined, { shallow: true });
    setImageData('');
  }, [router]);

  const [state, setState] = useState(UploadState.default);
  const uploadPost: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        e.preventDefault();

        // don't duplicate requests
        if (state === UploadState.uploading) return;

        setState(UploadState.uploading);
        const form = e.target as HTMLFormElement;

        await apiClient.post<Post>('/api/post', new FormData(form));

        closeEditor();
      } catch (err) {
        console.error(err?.response?.data?.error || err);
        alert([t('Upload failed'), err?.response?.data?.message].join(' - '));
      } finally {
        setState(UploadState.default);
      }
    },
    [apiClient, closeEditor, state, t]
  );

  return (
    <Modal onClose={closeEditor} open={router.query.newPost?.length > 0}>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={uploadPost} ref={formRef}>
          <label className={cx(styles.picker, { [styles.selected]: imageData })} htmlFor="image">
            {imageData ? (
              <img alt="selection preview" className={styles.preview} src={imageData} />
            ) : (
              <div>{t('Pick an image')}</div>
            )}
            <input
              accept="image/*"
              id="image"
              name="file"
              onChange={handleFileChange}
              type="file"
            />
          </label>
          <Input className={styles.input} label={t('Title')} />
          <Button
            className={styles.input}
            disabled={state === UploadState.uploading}
            type="primary"
            submit
          >
            {state === UploadState.uploading ? t('Uploading...') : t('Post')}
          </Button>
        </form>
      </div>
    </Modal>
  );
};
