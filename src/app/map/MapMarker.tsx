import { GpsMarker } from '@prisma/client';
import { FC } from 'react';
import { Edit, MapPin } from 'react-feather';
import { useMap } from './context';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';
import { formatDate } from '@utils/date';

export const MapMarker: FC<{ marker: GpsMarker }> = ({ marker }) => {
  const { hasPermission } = useUser();
  const { markerDetails, setMarkerDetails, setMarkerToEdit } = useMap();

  return (
    <>
      {markerDetails === marker.id && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="glass absolute flex gap-2 whitespace-nowrap rounded-md p-1 text-xs">
          <div>
            <div>
              {marker.city}, {marker.country}
            </div>
            <div>{formatDate(marker.date)}</div>
          </div>
          {hasPermission(AuthorizationScopes.post) && (
            <div className="flex items-center">
              <button
                aria-label="Edit marker"
                className="button action"
                onClick={() => setMarkerToEdit(marker)}
              >
                <Edit size={16} strokeWidth={1} />
              </button>
            </div>
          )}
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
