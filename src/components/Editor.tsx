import cx from 'classnames';
import { useRouter } from 'next/router';
import { ChangeEventHandler, FC, FormEventHandler, useCallback, useState } from 'react';
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
  const router = useRouter();
  const { addPost, apiClient } = useDataStore();
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

  const [state, setState] = useState(UploadState.default);
  const uploadPost: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        // don't duplicate requests
        if (state === UploadState.uploading) return;

        setState(UploadState.uploading);
        e.preventDefault();
        const form = e.target as HTMLFormElement;

        const { data } = await apiClient.post<Post>('/api/post', new FormData(form));

        form.reset();
        setImageData('');
        addPost(data);
        router.push({ query: { newPost: undefined } });
      } catch (err) {
        console.error(err?.response?.data?.error || err);
        alert(['Upload failed', err?.response?.data?.message].join(' - '));
      } finally {
        setState(UploadState.default);
      }
    },
    [addPost, apiClient, router, state]
  );

  return (
    <Modal
      onClose={() => router.push({ query: { newPost: undefined } })}
      open={router.query.newPost?.length > 0}
    >
      <div className={styles.container}>
        <form className={styles.form} onSubmit={uploadPost}>
          <label className={cx(styles.picker, { [styles.selected]: imageData })} htmlFor="image">
            {imageData ? (
              <img alt="selection preview" className={styles.preview} src={imageData} />
            ) : (
              <div>Pick an image</div>
            )}
            <input
              accept="image/*"
              id="image"
              name="file"
              onChange={handleFileChange}
              type="file"
            />
          </label>
          <Input className={styles.input} label="Title" />
          <Button
            className={styles.input}
            disabled={state === UploadState.uploading}
            type="primary"
            submit
          >
            {state === UploadState.uploading ? 'Uploading...' : 'Post'}
          </Button>
        </form>
      </div>
    </Modal>
  );
};
