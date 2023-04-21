import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head >
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Nextify is a NextJS project that works with TypeScript, React, Spotify Web API and TailwindCSS" />
        <meta name="author" content="Alejandro Roman" />
        <meta name="keywords" content="NextJS, TypeScript, React, Spotify, TailwindCSS" />
        <link rel="icon" href="/SpotifyIcon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
