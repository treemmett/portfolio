import { GpsMarker } from '@prisma/client';
import {
  Dispatch,
  FC,
  MouseEvent,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const mapContext = createContext<{
  markerDetails: string | null;
  markerToEdit: GpsMarker | null;
  setMarkerDetails: (id: string) => (e: MouseEvent) => void;
  setMarkerToEdit: Dispatch<SetStateAction<GpsMarker | null>>;
}>({
  markerDetails: null,
  markerToEdit: null,
  setMarkerDetails: () => () => null,
  setMarkerToEdit: () => null,
});

export const MapProvider: FC<PropsWithChildren> = ({ children }) => {
  const [markerDetails, setMarkerDetailsState] = useState<string | null>(null);
  const [markerToEdit, setMarkerToEdit] = useState<GpsMarker | null>(null);

  const setMarkerDetails = useCallback(
    (id: string) => (e: MouseEvent) => {
      e.stopPropagation();
      setMarkerDetailsState(id);
    },
    [],
  );

  const closeHandler = useCallback(() => {
    setMarkerDetailsState(null);
  }, []);

  const keyHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeHandler();
      }
    },
    [closeHandler],
  );

  useEffect(() => {
    window.addEventListener('click', closeHandler);
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('click', closeHandler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [closeHandler, keyHandler]);

  const value = useMemo(
    () => ({ markerDetails, markerToEdit, setMarkerDetails, setMarkerToEdit }),
    [markerDetails, markerToEdit, setMarkerDetails],
  );

  return <mapContext.Provider value={value}>{children}</mapContext.Provider>;
};

export const useMap = () => useContext(mapContext);
