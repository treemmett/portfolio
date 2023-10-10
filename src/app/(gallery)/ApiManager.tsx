'use client';

import { Site } from '@prisma/client';
import axios, { AxiosProgressEvent } from 'axios';
import cx from 'classnames';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, UploadCloud } from 'react-feather';
import { ulid } from 'ulid';
import { getUploadToken, processPhoto } from './actions';
import { Button } from '@components/Button';
import { useUser } from '@lib/user';
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

export const ApiManager: FC<{ site: Site }> = ({ site }) => {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { push } = useRouter();
  const { user } = useUser();

  const addFiles = useCallback(
    async (files: FileList) => {
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
    [requests],
  );

  const dropHandler = useCallback(
    async (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!e.dataTransfer) return;

      if (!user) {
        throw new UnauthenticatedError();
      }

      if (site.ownerId !== user.id) {
        push(`/u/${encodeURIComponent(user.username)}`);
        return;
      }

      const { files } = e.dataTransfer;

      await addFiles(files);
    },
    [addFiles, push, site.ownerId, user],
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

  const uploadPhoto = useCallback(async (request: ApiRequest) => {
    try {
      setRequests((rs) => [
        { ...request, status: 'uploading' },
        ...rs.filter((r) => r.id !== request.id),
      ]);

      const uploadToken = await getUploadToken();

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
                progress: 0.05 + progress.progress * 0.95,
              } as ApiRequest,
              ...filtered,
            ];
          });
        },
      });

      await processPhoto(uploadToken.token);

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
  }, []);

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

  return (
    <div className="fixed bottom-0 left-3 sm:bottom-3">
      <label
        className="inline-flex cursor-pointer items-center rounded-lg p-2 drop-shadow-lg backdrop-blur-sm dark:bg-zinc-900/50"
        htmlFor="file-selector"
      >
        <UploadCloud className="mr-2" strokeWidth={1} />
        Upload
        <input
          accept="image/*"
          className="hidden"
          id="file-selector"
          onChange={(e) => {
            const { files } = e.currentTarget;
            if (!files) return;
            addFiles(files);
          }}
          type="file"
        />
      </label>

      {!!requests.length && (
        <div
          className="mt-2 w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-lg drop-shadow-lg backdrop-blur-sm dark:bg-zinc-900/50"
          data-testid="upload-manager"
        >
          <header className="align-center flex justify-between p-4">
            <span className="capitalize">{status}</span>
            <Button onClick={() => setCollapsed(!collapsed)} size="small" inverted>
              {collapsed ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </header>
          <div
            className={cx(
              'overflow-y-auto border-t border-black transition-[max-height] dark:border-white',
              {
                'max-h-0 border-t-0': collapsed,
                'max-h-60': !collapsed,
              },
            )}
          >
            {requests.map((r) => (
              <div
                className="flex items-center border-t border-black p-4 first:border-0 dark:border-white"
                key={r.id}
              >
                {r.thumbnailUrl && (
                  <img
                    alt="Uploading thumbnail"
                    className="max-w-8 mr-4 max-h-6"
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
      )}
    </div>
  );
};
