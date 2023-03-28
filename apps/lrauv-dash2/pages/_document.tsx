// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/lrauv-logo-w28.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />{' '}
        <link
          href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;700&display=swap"
          rel="stylesheet"
        />{' '}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
