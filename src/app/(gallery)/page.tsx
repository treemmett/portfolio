import { DynamicApiManager } from './DynamicApiManager';
import { getSite } from '@lib/getSite';

export default async function GalleryPage() {
  const site = await getSite();

  if (!site) return null;

  return <DynamicApiManager site={site} />;
}
