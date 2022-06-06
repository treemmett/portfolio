import Axios, { AxiosInstance } from 'axios';
import {
  createContext,
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ACCESS_TOKEN_STORAGE_KEY } from '../entities/Jwt';
import type { Post } from '../entities/Post';
import { Session } from '../entities/Session';

export interface DataStoreContext {
  apiClient: AxiosInstance;
  posts: Post[];
  lightBox?: MutableRefObject<HTMLAnchorElement>;
  loadPosts: () => void;
  login: (accessToken: string) => void;
  session?: Session;
  setLightBox: (lightBox?: DataStoreContext['lightBox']) => void;
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

export const dataStoreContext = createContext<DataStoreContext>({
  apiClient: Axios,
  loadPosts: () => null,
  login: () => null,
  posts: [],
  session: global.localStorage?.getItem(ACCESS_TOKEN_STORAGE_KEY)
    ? new Session(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
    : undefined,
  setLightBox: () => null,
  setPosts: () => null,
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC = ({ children }) => {
  const [session, setSession] = useState<Session>(
    global.localStorage?.getItem(ACCESS_TOKEN_STORAGE_KEY)
      ? new Session(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
      : undefined
  );
  const apiClient = useMemo(() => {
    const client = Axios.create({
      withCredentials: true,
    });
    client.interceptors.request.use((req) => {
      if (!req.headers) req.headers = {};

      if (session?.accessToken && session?.expiration > new Date()) {
        req.headers.authorization = `Bearer ${session.accessToken}`;
      }

      return req;
    });
    return client;
  }, [session]);

  const [lightBox, setLightBox] = useState<MutableRefObject<HTMLAnchorElement>>();

  const [posts, setPosts] = useState<Post[]>([]);
  const loadPosts = useCallback(async () => {
    const { data } = await apiClient.get('/api/post');
    setPosts(data);
  }, [apiClient, setPosts]);

  const login = useCallback((accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    setSession(new Session(accessToken));
  }, []);

  const contextValue = useMemo<DataStoreContext>(
    () => ({ apiClient, lightBox, loadPosts, login, posts, session, setLightBox, setPosts }),
    [apiClient, lightBox, loadPosts, login, posts, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
