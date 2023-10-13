import {
  FC,
  MouseEvent,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const mapContext = createContext<{
  markerDetails: string | null;
  setMarkerDetails: (id: string) => (e: MouseEvent) => void;
}>({
  markerDetails: null,
  setMarkerDetails: () => () => null,
});

export const MapProvider: FC<PropsWithChildren> = ({ children }) => {
  const [markerDetails, setMarkerDetailsState] = useState<string | null>(null);

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
    () => ({ markerDetails, setMarkerDetails }),
    [markerDetails, setMarkerDetails],
  );

  return <mapContext.Provider value={value}>{children}</mapContext.Provider>;
};

export const useMap = () => useContext(mapContext);
