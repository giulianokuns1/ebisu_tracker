import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/img/logo3.0-removebg-preview.png?v=3" type="image/png" />
                <link rel="apple-touch-icon" href="/img/logo3.0-removebg-preview.png?v=3" />
                <link rel="manifest" href="/site.webmanifest" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
