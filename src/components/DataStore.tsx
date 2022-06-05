import {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Post } from '../entities/Post';
import { apiClient } from '../utils/clients';

export interface DataStoreContext {
  posts: Post[];
  loadPosts: () => void;
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

export const dataStoreContext = createContext<DataStoreContext>({
  loadPosts: () => null,
  posts: [],
  setPosts: () => null,
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const loadPosts = useCallback(async () => {
    const { data } = await apiClient.get('/api/post');
    setPosts(data);
  }, [setPosts]);

  const contextValue = useMemo<DataStoreContext>(
    () => ({ loadPosts, posts, setPosts }),
    [loadPosts, posts]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
