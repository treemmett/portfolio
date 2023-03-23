import axios, { AxiosError } from 'axios';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FC, FormEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { useDataStore } from './DataStore';
import styles from './Editor.module.scss';
import { Input } from './Input';
import type { Post, UploadToken } from '@entities/Post';
import { apiClient } from '@utils/apiClient';

enum UploadState {
  default,
  uploading,
}

export const Editor: FC<{ post: Post }> = ({ post }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { dispatch } = useDataStore();

  const [file, setFile] = useState<File | null>();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const formRef = useRef<HTMLFormElement>(null);
  const closeEditor = useCallback(() => {
    if (formRef.current) {
      formRef.current.reset();
    }

    router.push({}, undefined, { shallow: true });

    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setFile(null);
  }, [router]);

  const [state, setState] = useState(UploadState.default);

  const uploadFile = useCallback(
    async (fileData: File, postData?: Pick<Post, 'location' | 'title'> & { date: string }) => {
      const thumbnailUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          if (reader.result) {
            res(reader.result.toString());
          } else {
            rej();
          }
        });
        reader.readAsDataURL(fileData);
      });

      dispatch({
        async startRequest(setProgress) {
          const { data: uploadToken } = await apiClient.post<UploadToken>('/post', postData, {
            onUploadProgress(progress: ProgressEvent) {
              setProgress((progress.loaded / progress.total) * 0.05);
            },
          });
          await axios.put(uploadToken.url, fileData, {
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            onUploadProgress(progress: ProgressEvent) {
              setProgress(0.05 + (progress.loaded / progress.total) * 0.9);
            },
          });

          const { data } = await apiClient.put<Post>(
            '/post',
            { token: uploadToken.token },
            {
              onUploadProgress(progress: ProgressEvent) {
                setProgress(0.95 + (progress.loaded / progress.total) * 0.05);
              },
            }
          );
          dispatch({
            post: data,
            type: 'ADD_POST',
          });
        },
        thumbnailUrl,
        type: 'ADD_API_REQUEST',
      });
    },
    [dispatch]
  );

  const formHandler: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        // don't duplicate requests
        if (state === UploadState.uploading) return;
        setState(UploadState.uploading);

        if (post.id) {
          const { data } = await apiClient.patch<Post>(`/post/${encodeURIComponent(post.id)}`, {
            created: new Date(date),
            location,
            title,
          });
          dispatch({ post: data, type: 'UPDATE_POST' });
        } else {
          if (!file) return;

          uploadFile(file, { date, location, title });
        }

        closeEditor();
      } catch (err) {
        console.error(
          (err as AxiosError<{ error?: { message?: string; code?: string } }>)?.response?.data
            ?.error || err
        );
        alert(
          [
            t('Upload failed'),
            (err as AxiosError<{ error?: { message?: string; code?: string } }>)?.response?.data
              ?.error?.message || 'Unknown error',
            (err as AxiosError<{ error?: { message?: string; code?: string } }>)?.response?.data
              ?.error?.code,
          ].join(' - ')
        );
      } finally {
        setState(UploadState.default);
      }
    },
    [closeEditor, date, dispatch, file, location, post.id, state, t, title, uploadFile]
  );

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setLocation(post.location);
      setDate(new Date(post.created).toISOString().split('T')[0]);
    }
  }, [post]);
  useEffect(() => {
    const dropHandler = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!e.dataTransfer) return;

      const { files } = e.dataTransfer;
      const [f] = files;

      if (files.length > 1) {
        [...files].forEach((i) => uploadFile(i));
      } else if (files.length === 1) {
        if (!router.query.newPost) {
          router.push({ query: { newPost: true } }, undefined, { shallow: true });
        }

        setFile(f);
      }
    };

    const dragHandler = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    window.addEventListener('drop', dropHandler);
    window.addEventListener('dragover', dragHandler);
    return () => {
      window.removeEventListener('drop', dropHandler);
      window.removeEventListener('dragover', dragHandler);
    };
  }, [router, uploadFile]);

  return (
    <form className={styles.form} onSubmit={formHandler} ref={formRef}>
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
        {state === UploadState.uploading ? t('Uploading...') : t(post ? 'Save' : 'Post')}
      </Button>
    </form>
  );
};
