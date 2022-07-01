import Axios, { AxiosInstance } from 'axios';
import {
  createContext,
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ACCESS_TOKEN_STORAGE_KEY } from '../entities/Jwt';
import type { Post } from '../entities/Post';
import { Session } from '../entities/Session';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '../pages/login';
import { Config } from '../utils/config';

export interface DataStoreContext {
  addPost: (post: Post) => void;
  apiClient: AxiosInstance;
  destroySession: () => void;
  posts: Post[];
  lightBox?: MutableRefObject<HTMLAnchorElement>;
  loadPosts: () => void;
  login: () => void;
  session: Session;
  setLightBox: (lightBox?: DataStoreContext['lightBox']) => void;
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

export const dataStoreContext = createContext<DataStoreContext>({
  addPost: () => null,
  apiClient: Axios,
  destroySession: () => null,
  loadPosts: () => null,
  login: () => null,
  posts: [],
  session: new Session(),
  setLightBox: () => null,
  setPosts: () => null,
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC = ({ children }) => {
  const [session, setSession] = useState(new Session());
  useEffect(() => {
    setSession(Session.restore());
  }, []);
  const apiClient = useMemo(() => {
    const client = Axios.create({
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

  const [lightBox, setLightBox] = useState<MutableRefObject<HTMLAnchorElement>>();

  const [posts, setPosts] = useState<Post[]>([]);
  const addPost = useCallback(
    (post: Post) => {
      const p = [post, ...posts];
      p.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      setPosts(p);
    },
    [posts]
  );
  const loadPosts = useCallback(async () => {
    const { data } = await apiClient.get<Post[]>('/api/post');
    data.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    setPosts(data);
  }, [apiClient, setPosts]);

  const login = useCallback(() => {
    if (session?.expiration > new Date()) return;

    const oauth = window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    const messageHandler = async (event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>) => {
      oauth.postMessage({
        type: 'OAUTH_CLOSE',
      } as OAuthCloseMessage);

      if (event.data.type === 'OAUTH_ERROR') {
        throw new Error(event.data.payload);
      }

      if (event.data.type === 'OAUTH_CODE') {
        const loginResponse = await apiClient.post('/api/login', { code: event.data.payload });
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, loginResponse.data);
        setSession(new Session(loginResponse.data));
      }
    };

    oauth.addEventListener('message', messageHandler);
  }, [apiClient, session?.expiration]);

  const destroySession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setSession(new Session());
  }, []);

  const contextValue = useMemo<DataStoreContext>(
    () => ({
      addPost,
      apiClient,
      destroySession,
      lightBox,
      loadPosts,
      login,
      posts,
      session,
      setLightBox,
      setPosts,
    }),
    [addPost, apiClient, destroySession, lightBox, loadPosts, login, posts, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
