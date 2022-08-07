import {
  createContext,
  Dispatch,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
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
  lightBox?: MutableRefObject<HTMLElement>;
  markers: Marker[];
  posts: Post[];
  session: Session;
  requests: ApiRequest[];
}

export type Action =
  | { type: 'ADD_API_REQUEST'; id: string }
  | { type: 'ADD_MARKER'; marker: Marker }
  | { type: 'ADD_POST'; post: Post }
  | { type: 'DELETE_POST'; id: string }
  | { type: 'LOGIN'; session: Session }
  | { type: 'LOGOUT' }
  | { type: 'SET_LIGHT_BOX'; ref?: MutableRefObject<HTMLElement> }
  | { type: 'SET_API_REQUEST_STATUS'; id: string; progress?: number; status?: ApiRequest['status'] }
  | { type: 'UPDATE_POST'; post: Post };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_API_REQUEST':
      return {
        ...state,
        requests: [
          { id: action.id, progress: 0, status: 'uploading', type: 'upload' },
          ...state.requests,
        ],
      };

    case 'ADD_MARKER':
      return {
        ...state,
        markers: [action.marker, ...state.markers],
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
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, action.session.accessToken);
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

    case 'SET_LIGHT_BOX':
      return {
        ...state,
        lightBox: action.ref,
      };

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
  markers?: Marker[];
  posts?: Post[];
}

export interface DataStoreProviderProps extends PropsWithChildren {
  defaults: DefaultState;
}

const defaultState = {
  markers: [],
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

  const ContextValue = useMemo<ContextValue>(() => ({ ...state, dispatch }), [state]);

  return <dataStoreContext.Provider value={ContextValue}>{children}</dataStoreContext.Provider>;
};
