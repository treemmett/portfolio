import axios from 'axios';
import { LngLat } from 'mapbox-gl';
import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ulid } from 'ulid';
import { ACCESS_TOKEN_STORAGE_KEY } from '../entities/Jwt';
import { Marker } from '../entities/Marker';
import type { Post, UploadToken } from '../entities/Post';
import { Session } from '../entities/Session';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '../pages/login';
import { apiClient } from '../utils/apiClient';
import { Config } from '../utils/config';

export interface ApiRequest {
  id: string;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'complete';
  type: 'upload';
}

export interface DataStoreContext {
  addMarker(lngLat: LngLat): Promise<void>;
  addPost(file: File, date?: string, location?: string, title?: string): Promise<void>;
  deletePost(id: string): Promise<void>;
  destroySession: () => void;
  lightBox?: MutableRefObject<HTMLElement>;
  login(): void;
  markers: Marker[];
  posts: Post[];
  session: Session;
  setLightBox(lightBox?: DataStoreContext['lightBox']): void;
  requests: ApiRequest[];
  updatePost(
    id: string,
    update: Partial<Pick<Post, 'title' | 'location' | 'created'>>
  ): Promise<void>;
}

export interface DataStoreDefaults {
  markers?: Marker[];
  posts?: Post[];
}

export interface DataStoreProviderProps extends PropsWithChildren {
  defaults: DataStoreDefaults;
}

export const dataStoreContext = createContext<DataStoreContext>({
  addMarker: () => Promise.resolve(),
  addPost: () => Promise.resolve(),
  deletePost: () => Promise.resolve(),
  destroySession: () => null,
  login: () => null,
  markers: [],
  posts: [],
  requests: [],
  session: new Session(),
  setLightBox: () => null,
  updatePost: () => Promise.resolve(),
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC<DataStoreProviderProps> = ({ children, defaults }) => {
  const [session, setSession] = useState(new Session());
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  useEffect(() => {
    setSession(Session.restore());
  }, []);

  useEffect(() => {
    const id = apiClient.interceptors.request.use((req) => {
      if (!req.headers) req.headers = {};

      if (session.isValid()) {
        req.headers.authorization = `Bearer ${session.accessToken}`;
      }

      return req;
    });

    return () => apiClient.interceptors.request.eject(id);
  }, [session]);

  const [lightBox, setLightBox] = useState<MutableRefObject<HTMLElement>>();

  const [markers, setMarkers] = useState<Marker[]>(defaults.markers || []);
  const [posts, setPosts] = useState<Post[]>(defaults.posts || []);

  const contextValue = useMemo<DataStoreContext>(
    () => ({
      async addMarker(lngLat: LngLat) {
        const { data } = await apiClient.post<Marker>('/timeline', lngLat);
        setMarkers([data, ...markers]);
      },
      async addPost(file, date, location, title) {
        const requestId = ulid();

        setRequests([
          ...requests,
          { id: requestId, progress: 0, status: 'uploading', type: 'upload' },
        ]);

        const { data: uploadToken } = await apiClient.post<UploadToken>(
          '/post',
          {
            date,
            location,
            title,
          },
          {
            onUploadProgress(e: ProgressEvent) {
              setRequests((rs) => {
                const request = rs.find((r) => r.id === requestId);
                request.progress = (e.loaded / e.total) * 0.1;
                return [...rs];
              });
            },
          }
        );
        await axios.put(uploadToken.url, file, {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          onUploadProgress(e: ProgressEvent) {
            setRequests((rs) => {
              const request = rs.find((r) => r.id === requestId);
              request.progress = 0.1 + (e.loaded / e.total) * 0.8;
              return [...rs];
            });
          },
        });
        const { data } = await apiClient.put<Post>(
          '/post',
          { token: uploadToken.token },
          {
            onUploadProgress(e: ProgressEvent) {
              setRequests((rs) => {
                const request = rs.find((r) => r.id === requestId);
                request.progress = 0.9 + (e.loaded / e.total) * 0.1;
                return [...rs];
              });
            },
          }
        );
        setRequests((rs) => {
          const request = rs.find((r) => r.id === requestId);
          request.status = 'complete';
          return [...rs];
        });
        const p = [data, ...posts].sort(
          (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        setPosts(p);
      },
      async deletePost(id) {
        await apiClient.delete(`/post/${encodeURIComponent(id)}`);
        const newPosts = [...posts];
        const index = newPosts.findIndex((p) => p.id === id);
        if (~index) {
          newPosts.splice(index, 1);
          setPosts(newPosts);
        }
      },
      destroySession() {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        setSession(new Session());
      },
      lightBox,
      login() {
        if (session?.expiration > new Date()) return;

        const popup = window.open(
          `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
          'oauth',
          `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
        );

        const intervalId = setInterval(() => {
          if (popup.closed) {
            setSession(new Session());
            clearInterval(intervalId);
          }
        }, 100);

        const messageHandler = async (
          event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>
        ) => {
          if (event.origin !== window.location.origin) {
            throw new Error('Message failed cross-origin check');
          }

          clearInterval(intervalId);

          event.source.postMessage({
            type: 'OAUTH_CLOSE',
          } as OAuthCloseMessage);

          window.removeEventListener('message', messageHandler);

          if (event.data.type === 'OAUTH_ERROR') {
            setSession(new Session());
            throw new Error(event.data.payload);
          }

          if (event.data.type === 'OAUTH_CODE') {
            const loginResponse = await apiClient.post('/login', { code: event.data.payload });
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, loginResponse.data);
            setSession(new Session(loginResponse.data));
          }
        };

        setSession((s) => s.startAuthorization());

        window.addEventListener('message', messageHandler);
      },
      markers,
      posts,
      requests,
      session,
      setLightBox,
      async updatePost(id, update) {
        const { data } = await apiClient.patch<Post>(`/post/${encodeURIComponent(id)}`, update);
        const newPosts = [...posts];
        const index = newPosts.findIndex((p) => p.id === id);
        newPosts.splice(index, 1);
        newPosts.push(data);
        newPosts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        setPosts(newPosts);
      },
    }),
    [lightBox, markers, posts, requests, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
