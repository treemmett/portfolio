import cx from 'classnames';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ReactComponent as Plus } from '../icons/plusSquare.svg';
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
  const { addPost, posts } = useDataStore();

  const [imageData, setImageData] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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

    router.push({}, undefined, { shallow: true });

    setTitle('');
    setImageData('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
  }, [router]);

  const [state, setState] = useState(UploadState.default);
  const uploadPost: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        e.preventDefault();

        // don't duplicate requests
        if (state === UploadState.uploading) return;
        setState(UploadState.uploading);
        await addPost(new FormData(e.currentTarget));
        closeEditor();
      } catch (err) {
        console.error(err?.response?.data?.error || err);
        alert([t('Upload failed'), err?.response?.data?.message].join(' - '));
      } finally {
        setState(UploadState.default);
      }
    },
    [addPost, closeEditor, state, t]
  );

  useEffect(() => {
    if (router.query.edit) {
      const post = posts.find((p) => p.id === router.query.edit);

      if (post) {
        setImageData(post.photos[0].url);
        setTitle(post.title);
        setLocation(post.location);
        setDate(new Date(post.created).toISOString().split('T')[0]);
      }
    }
  }, [posts, router.query.edit]);

  const [open, setOpen] = useState(!!(router.query.newPost?.length > 0 || router.query.edit));
  useEffect(() => {
    setOpen(!!(router.query.newPost?.length > 0 || router.query.edit));
  }, [router.query.newPost, router.query.edit]);

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
                onChange={handleFileChange}
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
              defaultValue={new Date().toISOString().split('T')[0]}
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
              {state === UploadState.uploading ? t('Uploading...') : t('Post')}
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
