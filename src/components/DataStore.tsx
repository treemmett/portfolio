import Axios, { AxiosInstance } from 'axios';
import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ACCESS_TOKEN_STORAGE_KEY } from '../entities/Jwt';
import { Session } from '../entities/Session';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '../pages/login';
import { Config } from '../utils/config';

export interface DataStoreContext {
  apiClient: AxiosInstance;
  deletePost(id: string): Promise<void>;
  destroySession: () => void;
  lightBox?: MutableRefObject<HTMLElement>;
  login: () => void;
  session: Session;
  setLightBox: (lightBox?: DataStoreContext['lightBox']) => void;
}

export const dataStoreContext = createContext<DataStoreContext>({
  apiClient: Axios,
  deletePost: () => Promise.resolve(),
  destroySession: () => null,
  login: () => null,
  session: new Session(),
  setLightBox: () => null,
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC<PropsWithChildren> = ({ children }) => {
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

  const login = useCallback(() => {
    if (session?.expiration > new Date()) return;

    const messageHandler = async (event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>) => {
      if (event.origin !== window.location.origin) {
        throw new Error('Message failed cross-origin check');
      }

      event.source.postMessage({
        type: 'OAUTH_CLOSE',
      } as OAuthCloseMessage);

      window.removeEventListener('message', messageHandler);

      if (event.data.type === 'OAUTH_ERROR') {
        throw new Error(event.data.payload);
      }

      if (event.data.type === 'OAUTH_CODE') {
        const loginResponse = await apiClient.post('/login', { code: event.data.payload });
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, loginResponse.data);
        setSession(new Session(loginResponse.data));
      }
    };

    window.addEventListener('message', messageHandler);

    window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );
  }, [apiClient, session?.expiration]);

  const destroySession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setSession(new Session());
  }, []);

  const contextValue = useMemo<DataStoreContext>(
    () => ({
      apiClient,
      async deletePost(id) {
        await apiClient.delete(`/post/${encodeURIComponent(id)}`);
      },
      destroySession,
      lightBox,
      login,
      session,
      setLightBox,
    }),
    [apiClient, destroySession, lightBox, login, session]
  );

  return <dataStoreContext.Provider value={contextValue}>{children}</dataStoreContext.Provider>;
};
