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
import { apiClient } from '../utils/apiClient';

export interface ApiRequest {
  id: string;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'complete';
  type: 'upload';
}

export interface State {
  addMarker(marker: Marker): Promise<void>;
  addPost(post: Post): void;
  deletePost(id: string): void;
  destroySession: () => void;
  lightBox?: MutableRefObject<HTMLElement>;
  markers: Marker[];
  posts: Post[];
  session: Session;
  setLightBox(lightBox?: State['lightBox']): void;
  setRequests: Dispatch<SetStateAction<ApiRequest[]>>;
  setSession: Dispatch<SetStateAction<Session>>;
  requests: ApiRequest[];
  updatePost(id: string, update: Post): void;
}

export interface DefaultState {
  markers?: Marker[];
  posts?: Post[];
}

export interface DataStoreProviderProps extends PropsWithChildren {
  defaults: DefaultState;
}

export const dataStoreContext = createContext<State>({
  addMarker: () => Promise.resolve(),
  addPost: () => null,
  deletePost: () => null,
  destroySession: () => null,
  markers: [],
  posts: [],
  requests: [],
  session: new Session(),
  setLightBox: () => null,
  setRequests: () => null,
  setSession: () => null,
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

  const contextValue = useMemo<State>(
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
      markers,
      posts,
      requests,
      session,
      setLightBox,
      setRequests,
      setSession,
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
