import Head from 'next/head'

export default function SEO({ title }) {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5"
      />
      <title>{title || 'Oqtepa Lavash'}</title>
      <meta
        name="description"
        content="Oqtepa Lavash® является прекрасным местом для встреч с друзьями, вкусной еды и отличного настроения."
      />
      <meta
        name="keywords"
        content="oqtepa, lavash, oqtepalavash, oqtepa lavash, haggi, jo'ja, set, pizza, fast food, burger, dostavka, yetkazib berish, tashkent"
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Oqtepa Lavash" key="ogtitle" />
      <meta
        property="og:description"
        content="Oqtepa Lavash® является прекрасным местом для встреч с друзьями, вкусной еды и отличного настроения."
        key="ogdesc"
      />
      <meta
        property="og:site_name"
        content={title || 'Oqtepa Lavash'}
        key="ogsitename"
      />
      <meta property="og:image" content="/images/bot_logo.png" key="ogimage" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title || 'Oqtepa Lavash'} />
      <meta
        name="twitter:description"
        content="Oqtepa Lavash® является прекрасным местом для встреч с друзьями, вкусной еды и отличного настроения."
      />
      <meta name="twitter:site" content={title || 'Oqtepa Lavash'} />
      <meta name="twitter:creator" content="Delever" />
      <meta name="twitter:image" content="/images/bot_logo.png" />

      <link rel="icon" href="/faviconV2.svg" />
    </Head>
  )
}
