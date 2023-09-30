import Map from './Map';
import { Nav } from '@components/Nav';
import { getGpsMarkers } from '@lib/getGpsMarkers';

export default async function MapPage() {
  const markers = await getGpsMarkers();

  return (
    <>
      <Nav />
      <Map markers={markers} />
    </>
  );
}
