import { createContext, Dispatch, FC, SetStateAction, useContext, useMemo, useState } from 'react';
import type { Post } from '../entities/Post';

export interface DataStoreContext {
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

export const dataStoreContext = createContext<DataStoreContext>({
  posts: [],
  setPosts: () => null,
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const contextValue = useMemo<DataStoreContext>(() => ({ posts, setPosts }), [posts]);

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
