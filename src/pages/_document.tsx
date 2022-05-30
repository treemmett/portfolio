import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class Doc extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          {/* <link
            href="https://fonts.googleapis.com/css2?family=Gowun+Batang:400,500&display=swap"
            rel="stylesheet"
          /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
