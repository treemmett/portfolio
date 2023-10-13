import { GpsMarker } from '@prisma/client';
import { FC } from 'react';
import { MapPin } from 'react-feather';
import { useMap } from './context';
import { formatDate } from '@utils/date';

export const MapMarker: FC<{ marker: GpsMarker }> = ({ marker }) => {
  const { markerDetails, setMarkerDetails } = useMap();

  return (
    <>
      {markerDetails === marker.id && (
        <div className="glass absolute whitespace-nowrap rounded-md p-1 text-xs">
          <div>
            {marker.city}, {marker.country}
          </div>
          <div>{formatDate(marker.date)}</div>
        </div>
      )}
      <MapPin
        className="[&>circle]:fill-white [&>circle]:dark:fill-zinc-800 [&>path]:fill-gray-200/90 [&>path]:dark:fill-zinc-800/90"
        onClick={setMarkerDetails(marker.id)}
        strokeWidth={1}
      />
    </>
  );
};
