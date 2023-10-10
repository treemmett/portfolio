import { NextRequest, NextResponse } from 'next/server';
import { launch } from 'puppeteer';

export async function GET(request: NextRequest) {
  const link = request.nextUrl.searchParams.get('link');
  const json = request.nextUrl.searchParams.get('json');

  const browser = await launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(
    `${request.nextUrl.protocol}//${request.nextUrl.host}/resume/custom?${[
      ['link', link as string],
      ['json', json as string],
    ]
      .filter(([, value]) => !!value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')}`,
  );
  const pdf = await page.pdf({ format: 'A4', scale: 0.5 });
  await browser.close();

  return new NextResponse(pdf, {
    headers: {
      'Content-Disposition': 'inline;filename="resume.pdf"',
      'Content-Length': pdf.byteLength.toString(),
      'Content-Type': 'application/pdf',
    },
  });
}
