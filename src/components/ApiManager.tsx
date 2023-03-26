import axios from 'axios';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useState } from 'react';
import { ulid } from 'ulid';
import styles from './ApiManager.module.scss';
import { Button } from './Button';
import type { IPost, UploadToken } from '@entities/Post';
import { ReactComponent as ChevronDown } from '@icons/chevron-down.svg';
import { ReactComponent as ChevronUp } from '@icons/chevron-up.svg';
import { usePosts } from '@lib/posts';
import { useSite } from '@lib/site';
import { useUser } from '@lib/user';
import { apiClient } from '@utils/apiClient';
import { UnauthenticatedError } from '@utils/errors';

interface ApiRequest {
  id: string;
  progress: number;
  file: File;
  name: string;
  status: 'error' | 'queued' | 'uploading' | 'complete';
  thumbnailUrl?: string;
}

async function loadFile(file: File): Promise<ApiRequest> {
  try {
    const thumbnailUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();

      reader.addEventListener('error', () => {
        rej();
      });

      reader.addEventListener('load', () => {
        res(reader.result as string);
      });

      reader.readAsDataURL(file);
    });

    return {
      file,
      id: ulid(),
      name: file.name,
      progress: 0,
      status: 'queued',
      thumbnailUrl,
    };
  } catch {
    return {
      file,
      id: ulid(),
      name: file.name,
      progress: 0,
      status: 'error',
    };
  }
}

export const ApiManager: FC = () => {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { addPost } = usePosts();
  const { push } = useRouter();
  const { user } = useUser();
  const { site } = useSite();

  const dropHandler = useCallback(
    async (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!e.dataTransfer) return;

      if (!user) {
        throw new UnauthenticatedError();
      }

      if (site?.owner.id !== user.id) {
        push({ href: '/u/[username]', query: { username: user.username } });
        return;
      }

      const { files } = e.dataTransfer;

      const fileList = await Promise.all(
        [...files].reduce((acc, file) => {
          if (file.type.startsWith('image/')) {
            acc.push(loadFile(file));
          }

          return acc;
        }, [] as Promise<ApiRequest>[])
      );

      setRequests([...fileList, ...requests]);
    },
    [push, requests, site?.owner.id, user]
  );

  const dragHandler = useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('drop', dropHandler);
    window.addEventListener('dragover', dragHandler);

    return () => {
      window.removeEventListener('drop', dropHandler);
      window.removeEventListener('dragover', dragHandler);
    };
  }, [dragHandler, dropHandler]);

  const uploadPhoto = useCallback(
    async (request: ApiRequest) => {
      setRequests((rs) => [
        { ...request, status: 'uploading' },
        ...rs.filter((r) => r.id !== request.id),
      ]);

      const { data: uploadToken } = await apiClient.post<UploadToken>('/post', {
        onUploadProgress(progress: ProgressEvent) {
          setRequests((rs) => {
            const filtered = rs.filter((r) => r.id !== request.id);
            const thisRequest = rs.find((r) => r.id === request.id);

            return [
              { ...thisRequest, progress: (progress.loaded / progress.total) * 0.05 } as ApiRequest,
              ...filtered,
            ];
          });
        },
      });

      await axios.put(uploadToken.url, request.file, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        onUploadProgress(progress: ProgressEvent) {
          setRequests((rs) => {
            const filtered = rs.filter((r) => r.id !== request.id);
            const thisRequest = rs.find((r) => r.id === request.id);

            return [
              {
                ...thisRequest,
                progress: 0.05 + (progress.loaded / progress.total) * 0.9,
              } as ApiRequest,
              ...filtered,
            ];
          });
        },
      });

      const { data } = await apiClient.put<IPost>(
        '/post',
        { token: uploadToken.token },
        {
          onUploadProgress(progress: ProgressEvent) {
            setRequests((rs) => {
              const filtered = rs.filter((r) => r.id !== request.id);
              const thisRequest = rs.find((r) => r.id === request.id);

              return [
                {
                  ...thisRequest,
                  progress: 0.95 + (progress.loaded / progress.total) * 0.05,
                } as ApiRequest,
                ...filtered,
              ];
            });
          },
        }
      );

      addPost(data);

      setRequests((rs) => {
        const filtered = rs.filter((r) => r.id !== request.id);
        const thisRequest = rs.find((r) => r.id === request.id);

        return [
          {
            ...thisRequest,
            status: 'complete',
          } as ApiRequest,
          ...filtered,
        ];
      });
    },
    [addPost]
  );

  useEffect(() => {
    const uploading = requests.filter((r) => r.status === 'uploading');

    if (uploading.length < 3) {
      const nextRequest = requests.find((f) => f.status === 'queued');

      if (nextRequest) {
        uploadPhoto(nextRequest);
      }
    }
  }, [requests, uploadPhoto]);

  if (!requests.length) return null;

  return (
    <div className={styles.manager} data-testid="upload-manager">
      <header className={styles.header}>
        <span>Uploading</span>
        <Button
          className={styles['collapse-button']}
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          inverted
        >
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </header>
      <div className={cx(styles.list, { [styles.collapsed]: collapsed })}>
        {requests.map((r) => (
          <div className={styles.item} key={r.id}>
            {r.thumbnailUrl && (
              <img alt="Uploading thumbnail" className={styles.thumbnail} src={r.thumbnailUrl} />
            )}
            {r.status === 'uploading' ? (
              <span>{Math.floor(r.progress * 100)}%</span>
            ) : (
              <span className={styles.status}>{r.status}</span>
            )}

            <span className={styles.name}>{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
