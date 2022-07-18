import Axios, { AxiosInstance } from 'axios';
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
import { ACCESS_TOKEN_STORAGE_KEY } from '../entities/Jwt';
import { Post } from '../entities/Post';
import { Session } from '../entities/Session';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '../pages/login';
import { Config } from '../utils/config';

export interface DataStoreContext {
  addPost(form: FormData): Promise<void>;
  apiClient: AxiosInstance;
  deletePost(id: string): Promise<void>;
  destroySession: () => void;
  lightBox?: MutableRefObject<HTMLElement>;
  login(): void;
  posts: Post[];
  session: Session;
  setLightBox(lightBox?: DataStoreContext['lightBox']): void;
  updatePost(
    id: string,
    update: Partial<Pick<Post, 'title' | 'location' | 'created'>>
  ): Promise<void>;
}

export interface DataStoreProviderProps extends PropsWithChildren {
  defaultPosts?: Post[];
}

export const dataStoreContext = createContext<DataStoreContext>({
  addPost: () => Promise.resolve(),
  apiClient: Axios,
  deletePost: () => Promise.resolve(),
  destroySession: () => null,
  login: () => null,
  posts: [],
  session: new Session(),
  setLightBox: () => null,
  updatePost: () => Promise.resolve(),
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC<DataStoreProviderProps> = ({ children, defaultPosts }) => {
  const [session, setSession] = useState(new Session());
  useEffect(() => {
    setSession(Session.restore());
  }, []);
  const apiClient = useMemo(() => {
    const client = Axios.create({
      baseURL: '/api',
      withCredentials: true,
    });
    client.interceptors.request.use((req) => {
      if (!req.headers) req.headers = {};

      if (session.isValid()) {
        req.headers.authorization = `Bearer ${session.accessToken}`;
      }

      return req;
    });
    return client;
  }, [session]);

  const [lightBox, setLightBox] = useState<MutableRefObject<HTMLElement>>();

  const [posts, setPosts] = useState<Post[]>(defaultPosts || []);

  const contextValue = useMemo<DataStoreContext>(
    () => ({
      async addPost(formData) {
        const { data } = await apiClient.post<Post>('/post', formData);
        const p = [data, ...posts].sort(
          (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        setPosts(p);
      },
      apiClient,
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

        setSession(Session.authorize());

        window.addEventListener('message', messageHandler);
      },
      posts,
      session,
      setLightBox,
      async updatePost(id, update) {
        const { data } = await apiClient.put<Post>(`/post/${encodeURIComponent(id)}`, update);
        const newPosts = [...posts];
        const index = newPosts.findIndex((p) => p.id === id);
        newPosts.splice(index, 1);
        newPosts.push(data);
        newPosts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        setPosts(newPosts);
      },
    }),
    [apiClient, lightBox, posts, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
