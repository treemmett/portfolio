import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class Doc extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link href="/favicon.ico" rel="icon" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
