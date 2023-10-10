import { NextRequest, NextResponse } from 'next/server';
import { launch } from 'puppeteer';
import { getSite } from '@lib/getSite';

export async function GET(request: NextRequest) {
  const [pdf, site] = await Promise.all([
    // eslint-disable-next-line no-async-promise-executor
    new Promise<Buffer>(async (res, rej) => {
      try {
        const browser = await launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(`${request.nextUrl.protocol}//${request.nextUrl.host}/resume`);
        const buffer = await page.pdf({ format: 'A4', scale: 0.5 });
        await browser.close();
        res(buffer);
      } catch (err) {
        rej(err);
      }
    }),
    getSite(),
  ]);

  return new NextResponse(pdf, {
    headers: {
      'Cache-Control': `public, max-age=${60 * 60 * 24 * 30}`,
      'Content-Disposition': `inline;filename="${site.name?.replaceAll(' ', '_')}-resume.pdf"`,
      'Content-Length': pdf.byteLength.toString(),
      'Content-Type': 'application/pdf',
    },
  });
}
