import {
  createContext,
  Dispatch,
  FC,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ACCESS_TOKEN_STORAGE_KEY } from '../entities/Jwt';
import { Marker } from '../entities/Marker';
import type { Post } from '../entities/Post';
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
  addMarker(marker: Marker): Promise<void>;
  addPost(post: Post): void;
  deletePost(id: string): void;
  destroySession: () => void;
  lightBox?: MutableRefObject<HTMLElement>;
  login(): void;
  markers: Marker[];
  posts: Post[];
  session: Session;
  setLightBox(lightBox?: DataStoreContext['lightBox']): void;
  setRequests: Dispatch<SetStateAction<ApiRequest[]>>;
  requests: ApiRequest[];
  updatePost(id: string, update: Post): void;
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
  addPost: () => null,
  deletePost: () => null,
  destroySession: () => null,
  login: () => null,
  markers: [],
  posts: [],
  requests: [],
  session: new Session(),
  setLightBox: () => null,
  setRequests: () => null,
  updatePost: () => null,
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
      async addMarker(marker: Marker) {
        setMarkers([marker, ...markers]);
      },
      addPost(post) {
        setPosts(
          [post, ...posts].sort(
            (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
          )
        );
      },
      deletePost(id) {
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
      setRequests,
      async updatePost(id, update) {
        const newPosts = [...posts];
        const index = newPosts.findIndex((p) => p.id === id);
        newPosts.splice(index, 1);
        newPosts.push(update);
        newPosts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        setPosts(newPosts);
      },
    }),
    [lightBox, markers, posts, requests, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
