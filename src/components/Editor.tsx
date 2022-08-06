import cx from 'classnames';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FC, FormEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as Plus } from '../icons/plusSquare.svg';
import { toString } from '../utils/queryParam';
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
  const { addPost, posts, updatePost } = useDataStore();
  const editId = toString(router.query.edit);

  const [imageData, setImageData] = useState('');
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!file) {
      setImageData('');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageData(reader.result.toString());
    });
    reader.readAsDataURL(file);
  }, [file]);

  const formRef = useRef<HTMLFormElement>();
  const closeEditor = useCallback(() => {
    if (formRef.current) {
      formRef.current.reset();
    }

    router.push({}, undefined, { shallow: true });

    setTitle('');
    setImageData('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setFile(null);
  }, [router]);

  const [state, setState] = useState(UploadState.default);

  const uploadPost: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        // don't duplicate requests
        if (state === UploadState.uploading) return;
        setState(UploadState.uploading);

        if (editId) {
          await updatePost(editId, { created: new Date(date), location, title });
        } else {
          await addPost(file, date, location, title);
        }

        closeEditor();
      } catch (err) {
        console.error(err?.response?.data?.error || err);
        alert(
          [
            t('Upload failed'),
            err?.response?.data?.error?.message || 'Unknown error',
            err?.response?.data?.error?.code,
          ].join(' - ')
        );
      } finally {
        setState(UploadState.default);
      }
    },
    [addPost, closeEditor, date, editId, file, location, state, t, title, updatePost]
  );

  useEffect(() => {
    if (editId) {
      const post = posts.find((p) => p.id === editId);

      if (post) {
        setImageData(post.photos[0].url);
        setTitle(post.title);
        setLocation(post.location);
        setDate(new Date(post.created).toISOString().split('T')[0]);
      }
    }
  }, [posts, editId]);

  const [open, setOpen] = useState(!!(router.query.newPost?.length > 0 || editId));
  useEffect(() => {
    setOpen(!!(router.query.newPost?.length > 0 || editId));
  }, [router.query.newPost, editId]);

  useEffect(() => {
    const dropHandler = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const { files } = e.dataTransfer;
      const [f] = files;

      if (f) {
        if (!router.query.newPost) {
          router.push({ query: { newPost: true } }, undefined, { shallow: true });
        }

        setFile(f);
      }
    };

    const dragHandler = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    window.addEventListener('drop', dropHandler);
    window.addEventListener('dragover', dragHandler);
    return () => {
      window.removeEventListener('drop', dropHandler);
      window.removeEventListener('dragover', dragHandler);
    };
  }, [router]);

  return (
    <>
      <Button
        className={styles.button}
        onClick={() => router.push({ query: { newPost: true } }, undefined, { shallow: true })}
        testId="new post"
      >
        <Plus />
      </Button>

      <Modal onClose={closeEditor} open={open}>
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
                onChange={(e) => setFile(e.currentTarget.files[0])}
                type="file"
              />
            </label>
            <Input
              className={styles.input}
              label={t('Title')}
              name="title"
              onChange={(e) => setTitle(e.currentTarget.value)}
              value={title}
            />
            <Input
              className={styles.input}
              label={t('Location')}
              name="location"
              onChange={(e) => setLocation(e.currentTarget.value)}
              value={location}
            />
            <Input
              className={styles.input}
              label={t('Date')}
              name="date"
              onChange={(e) => setDate(e.currentTarget.value)}
              type="date"
              value={date}
            />
            <Button
              className={styles.input}
              disabled={state === UploadState.uploading}
              type="primary"
              submit
            >
              {state === UploadState.uploading ? t('Uploading...') : t(editId ? 'Save' : 'Post')}
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
