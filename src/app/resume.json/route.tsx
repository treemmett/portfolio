import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getSite } from '@lib/getSite';

export async function GET() {
  const site = await getSite();

  if (!site.resumeUrl) notFound();

  const response = await fetch(site.resumeUrl, { next: { tags: ['resume'] } });
  if (!response.ok) notFound();

  const resume = await response.json();

  return NextResponse.json(resume);
}
