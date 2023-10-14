import { GpsMarker } from '@prisma/client';
import cx from 'classnames';
import { FC } from 'react';
import { Edit, MapPin } from 'react-feather';
import { useMap } from './context';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';
import { formatDate } from '@utils/date';

export const MapMarker: FC<{ marker: GpsMarker }> = ({ marker }) => {
  const { hasPermission } = useUser();
  const { markerDetails, markerToEdit, setMarkerDetails, setMarkerToEdit } = useMap();

  return (
    <>
      {markerDetails === marker.id && (
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
        className={cx({
          '[&>circle]:fill-white [&>circle]:dark:fill-zinc-800 [&>path]:fill-gray-200/90 [&>path]:dark:fill-zinc-800/90':
            markerToEdit?.id !== marker.id,
          '[&>circle]:stroke-green-400 [&>path]:stroke-green-400': markerToEdit?.id === marker.id,
        })}
        onClick={setMarkerDetails(marker.id)}
        strokeWidth={1}
      />
    </>
  );
};
