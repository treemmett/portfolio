import Map from './Map';
import { getGpsMarkers } from '@lib/getGpsMarkers';

export default async function MapPage() {
  const markers = await getGpsMarkers();

  return <Map markers={markers} />;
}
