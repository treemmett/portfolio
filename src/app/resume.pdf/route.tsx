import ms from 'ms';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { getSite } from '@lib/getSite';
import { Config } from '@utils/config';

export async function GET(request: NextRequest) {
  const [pdf, site] = await Promise.all([
    // eslint-disable-next-line no-async-promise-executor
    new Promise<Buffer>(async (res, rej) => {
      try {
        const browser = await puppeteer.connect({
          browserWSEndpoint: `wss://chrome.browserless.io?token=${Config.BROWSERLESS_TOKEN}`,
        });
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
      'Cache-Control': `public, max-age=${Math.floor(ms('30d') / 1000)}`,
      'Content-Disposition': `inline;filename="${site.name?.replaceAll(' ', '_')}-resume.pdf"`,
      'Content-Length': pdf.byteLength.toString(),
      'Content-Type': 'application/pdf',
    },
  });
}
