import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { ulid } from 'ulid';
import { ACCESS_TOKEN_STORAGE_KEY } from '@entities/Jwt';
import type { Post } from '@entities/Post';
import { Session } from '@entities/Session';
import { apiClient, ApiRequest } from '@utils/apiClient';

export interface State {
  posts: Post[];
  session: Session;
  requests: ApiRequest[];
}

export type Action =
  | { type: 'ADD_API_REQUEST'; startRequest: ApiRequest['startRequest']; thumbnailUrl?: string }
  | { type: 'ADD_POST'; post: Post }
  | { type: 'DELETE_POST'; id: string }
  | { type: 'LOGIN'; session: Session }
  | { type: 'LOGOUT' }
  | { type: 'SET_API_REQUEST_STATUS'; id: string; progress?: number; status?: ApiRequest['status'] }
  | { type: 'UPDATE_POST'; post: Post };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_API_REQUEST':
      return {
        ...state,
        requests: [
          {
            id: ulid(),
            progress: 0,
            startRequest: action.startRequest,
            status: 'queued',
            thumbnailUrl: action.thumbnailUrl,
          },
          ...state.requests,
        ],
      };

    case 'ADD_POST':
      return {
        ...state,
        posts: [action.post, ...state.posts].sort(
          (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
        ),
      };

    case 'DELETE_POST': {
      const posts = [...state.posts];
      const index = posts.findIndex((p) => p.id === action.id);
      if (~index) {
        posts.splice(index, 1);
        return {
          ...state,
          posts,
        };
      }
      return state;
    }

    case 'LOGIN':
      if (action.session.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, action.session.accessToken);
      }
      return {
        ...state,
        session: action.session,
      };

    case 'LOGOUT': {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      return {
        ...state,
        session: new Session(),
      };
    }

    case 'SET_API_REQUEST_STATUS': {
      const requests = [...state.requests];
      const request = requests.find((r) => r.id === action.id);
      if (request) {
        if (typeof action.progress === 'number') {
          request.progress = action.progress;
        }

        if (action.status) {
          request.status = action.status;
        }

        return {
          ...state,
          requests,
        };
      }
      return state;
    }

    case 'UPDATE_POST': {
      const posts = [...state.posts];
      const index = posts.findIndex((p) => p.id === action.post.id);
      if (~index) {
        posts.splice(index, 1);
        posts.push(action.post);
        posts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        return {
          ...state,
          posts,
        };
      }

      return state;
    }

    default:
      return state;
  }
}

export interface DefaultState {
  posts?: Post[];
}

export interface DataStoreProviderProps extends PropsWithChildren {
  defaults: DefaultState;
}

const defaultState = {
  posts: [],
  requests: [],
  session: new Session(),
};

export interface ContextValue extends State {
  dispatch: Dispatch<Action>;
}

export const dataStoreContext = createContext<ContextValue>({
  ...defaultState,
  dispatch: () => null,
});

export const useDataStore = () => useContext(dataStoreContext);

export const DataStoreProvider: FC<DataStoreProviderProps> = ({ children, defaults }) => {
  const [state, dispatch] = useReducer(reducer, { ...defaultState, ...defaults });

  useEffect(() => {
    dispatch({
      session: Session.restore(),
      type: 'LOGIN',
    });
  }, []);

  useEffect(() => {
    const id = apiClient.interceptors.request.use((req) => {
      if (!req.headers) req.headers = {};

      if (state.session.isValid()) {
        req.headers.authorization = `Bearer ${state.session.accessToken}`;
      }

      return req;
    });

    return () => apiClient.interceptors.request.eject(id);
  }, [state.session]);

  useEffect(() => {
    const numberOfActiveRequests = state.requests.filter((r) => r.status === 'uploading').length;
    if (numberOfActiveRequests > 2) return;

    const requestToFire = state.requests.find((r) => r.status === 'queued');
    if (!requestToFire) return;

    dispatch({
      id: requestToFire.id,
      status: 'uploading',
      type: 'SET_API_REQUEST_STATUS',
    });

    requestToFire
      .startRequest((progress) =>
        dispatch({ id: requestToFire.id, progress, type: 'SET_API_REQUEST_STATUS' })
      )
      .then(() =>
        dispatch({ id: requestToFire.id, status: 'complete', type: 'SET_API_REQUEST_STATUS' })
      )
      .catch(() =>
        dispatch({ id: requestToFire.id, status: 'error', type: 'SET_API_REQUEST_STATUS' })
      );
  }, [state.requests]);

  const ContextValue = useMemo<ContextValue>(() => ({ ...state, dispatch }), [state]);

  return <dataStoreContext.Provider value={ContextValue}>{children}</dataStoreContext.Provider>;
};
