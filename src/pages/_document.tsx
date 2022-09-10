import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class Doc extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Bad+Script&family=Josefin+Sans:wght@300;400&display=swap"
            rel="stylesheet"
          />
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
