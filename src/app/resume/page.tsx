import { notFound } from 'next/navigation';
import { Resume } from './Resume';
import { getSite } from '@lib/getSite';

export default async function ResumePage() {
  const site = await getSite();

  if (!site.resumeUrl) notFound();

  const response = await fetch(site.resumeUrl, { next: { tags: ['resume'] } });
  if (!response.ok) notFound();

  const resume = await response.json();

  return <Resume resume={resume} />;
}
