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
import type { Post } from '@entities/Post';
import { ApiRequest } from '@utils/apiClient';

export interface State {
  requests: ApiRequest[];
}

export type Action =
  | { type: 'ADD_API_REQUEST'; startRequest: ApiRequest['startRequest']; thumbnailUrl?: string }
  | { type: 'LOGOUT' }
  | {
      type: 'SET_API_REQUEST_STATUS';
      id: string;
      progress?: number;
      status?: ApiRequest['status'];
    };

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
