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
import { apiClient } from '../utils/clients';

export interface DataStoreContext {
  posts: Post[];
  lightBox?: MutableRefObject<HTMLAnchorElement>;
  loadPosts: () => void;
  login: (accessToken: string) => void;
  session?: Session;
  setLightBox: (lightBox?: DataStoreContext['lightBox']) => void;
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

export const dataStoreContext = createContext<DataStoreContext>({
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
  const [posts, setPosts] = useState<Post[]>([]);
  const loadPosts = useCallback(async () => {
    const { data } = await apiClient.get('/api/post');
    setPosts(data);
  }, [setPosts]);

  const [session, setSession] = useState<Session>(
    global.localStorage?.getItem(ACCESS_TOKEN_STORAGE_KEY)
      ? new Session(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
      : undefined
  );
  const login = useCallback((accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    setSession(new Session(accessToken));
  }, []);

  const [lightBox, setLightBox] = useState<MutableRefObject<HTMLAnchorElement>>();

  const contextValue = useMemo<DataStoreContext>(
    () => ({ lightBox, loadPosts, login, posts, session, setLightBox, setPosts }),
    [lightBox, loadPosts, login, posts, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
