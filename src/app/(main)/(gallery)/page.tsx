import { Metadata } from 'next';
import { DynamicApiManager } from './DynamicApiManager';
import { getSite } from '@lib/getSite';

export default async function GalleryPage() {
  const site = await getSite();

  if (!site) return null;

  return <DynamicApiManager site={site} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();

  return {
    description: site.description,
    openGraph: {
      images: ['/og'],
    },
    title: site.title,
  };
}
