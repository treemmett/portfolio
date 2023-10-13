import { GpsMarker } from '@prisma/client';
import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { MapPin } from 'react-feather';
import { formatDate } from '@utils/date';

export const MapMarker: FC<{ marker: GpsMarker }> = ({ marker }) => {
  const [showInfo, setShowInfo] = useState(false);

  const clickHandler = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setShowInfo(true);
  }, []);

  const closeHandler = useCallback(() => {
    setShowInfo(false);
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
    window.addEventListener('mousedown', closeHandler);
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('mousedown', closeHandler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [closeHandler, keyHandler]);

  return (
    <>
      {showInfo && (
        <div className="glass absolute whitespace-nowrap rounded-md p-1 text-xs">
          <div>
            {marker.city}, {marker.country}
          </div>
          <div>{formatDate(marker.date)}</div>
        </div>
      )}
      <MapPin
        className="[&>circle]:fill-white [&>circle]:dark:fill-zinc-800 [&>path]:fill-gray-200/90 [&>path]:dark:fill-zinc-800/90"
        onClick={clickHandler}
        strokeWidth={1}
      />
    </>
  );
};
