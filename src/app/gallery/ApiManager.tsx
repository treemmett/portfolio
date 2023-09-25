'use client';

import axios, { AxiosProgressEvent } from 'axios';
import cx from 'classnames';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';
import { ulid } from 'ulid';
import { Button } from '@components/Button';
import type { UploadToken } from '@entities/Photo';
import type { IPost } from '@entities/Post';
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
        push(`/u/${encodeURIComponent(user.username)}`);
        return;
      }

      const { files } = e.dataTransfer;

      const fileList = await Promise.all(
        [...files].reduce((acc, file) => {
          if (file.type.startsWith('image/')) {
            acc.push(loadFile(file));
          }

          return acc;
        }, [] as Promise<ApiRequest>[]),
      );

      setRequests([...fileList, ...requests]);
    },
    [push, requests, site?.owner.id, user],
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
      try {
        setRequests((rs) => [
          { ...request, status: 'uploading' },
          ...rs.filter((r) => r.id !== request.id),
        ]);

        const { data: uploadToken } = await apiClient.post<UploadToken>('/post', {
          onUploadProgress(progress: AxiosProgressEvent) {
            setRequests((rs) => {
              const filtered = rs.filter((r) => r.id !== request.id);
              const thisRequest = rs.find((r) => r.id === request.id);

              if (typeof progress.progress === 'undefined') return rs;

              return [
                { ...thisRequest, progress: progress.progress * 0.05 } as ApiRequest,
                ...filtered,
              ];
            });
          },
        });

        await axios.put(uploadToken.url, request.file, {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          onUploadProgress(progress: AxiosProgressEvent) {
            setRequests((rs) => {
              const filtered = rs.filter((r) => r.id !== request.id);
              const thisRequest = rs.find((r) => r.id === request.id);

              if (typeof progress.progress === 'undefined') return rs;

              return [
                {
                  ...thisRequest,
                  progress: 0.05 + progress.progress * 0.9,
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
            onUploadProgress(progress: AxiosProgressEvent) {
              setRequests((rs) => {
                const filtered = rs.filter((r) => r.id !== request.id);
                const thisRequest = rs.find((r) => r.id === request.id);

                if (typeof progress.progress === 'undefined') return rs;

                return [
                  {
                    ...thisRequest,
                    progress: 0.95 + progress.progress * 0.05,
                  } as ApiRequest,
                  ...filtered,
                ];
              });
            },
          },
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
      } catch (err) {
        setRequests((rs) => {
          const filtered = rs.filter((r) => r.id !== request.id);
          const thisRequest = rs.find((r) => r.id === request.id);

          return [
            {
              ...thisRequest,
              status: 'error',
            } as ApiRequest,
            ...filtered,
          ];
        });
      }
    },
    [addPost],
  );

  const [status, setStatus] = useState<'uploading' | 'complete' | 'error'>('uploading');

  useEffect(() => {
    const uploading = requests.filter((r) => r.status === 'uploading');

    if (uploading.length < 3) {
      const nextRequest = requests.find((f) => f.status === 'queued');

      if (nextRequest) {
        uploadPhoto(nextRequest);
        setStatus('uploading');
      } else if (requests.find((f) => f.status === 'error')) {
        setStatus('error');
      } else {
        setStatus('complete');
      }
    }
  }, [requests, uploadPhoto]);

  if (!requests.length) return null;

  return (
    <div
      className="fixed backdrop-blur-sm dark:bg-zinc-900/50 drop-shadow-lg overflow-hidden w-[calc(100%-1.5rem)] max-w-lg rounded-lg bottom-0 sm:bottom-3 left-3"
      data-testid="upload-manager"
    >
      <header className="flex justify-between align-center p-4">
        <span className="capitalize">{status}</span>
        <Button onClick={() => setCollapsed(!collapsed)} size="small" inverted>
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </header>
      <div
        className={cx(
          'max-h-60 overflow-y-auto transition-[max-height] border-t border-black dark:border-white',
          {
            'max-h-0 border-t-0': collapsed,
          },
        )}
      >
        {requests.map((r) => (
          <div
            className="flex items-center p-4 border-t border-black dark:border-white first:border-0"
            key={r.id}
          >
            {r.thumbnailUrl && (
              <img
                alt="Uploading thumbnail"
                className="max-w-8 max-h-6 mr-4"
                src={r.thumbnailUrl}
              />
            )}
            {r.status === 'uploading' ? (
              <span className="mx-0.5">{Math.floor(r.progress * 100)}%</span>
            ) : (
              <span className="mx-0.5 capitalize">{r.status}</span>
            )}

            <span className="ml-auto text-right">{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
