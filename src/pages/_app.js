import Script from 'next/script'
import { ThemeProvider } from '@emotion/react'
import Layout from 'components/Layout'
import 'styles/globals.scss'
import theme from 'mui-theme'
import NextNProgress from 'nextjs-progressbar';
import { persistor, store } from '../store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { SWRConfig } from 'swr';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      {typeof window !== 'undefined' ? (
        <PersistGate loading={null} persistor={persistor}>
          <SWRConfig>
            <ThemeProvider theme={theme}>
              <Layout>
                <Script id="google-tag-manager" strategy="afterInteractive">
                  {`
                      (function(w,d,s,l,i){w[l] = w[l] || [];w[l].push({'gtm.start':
                      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                      })(window,document,'script','dataLayer','GTM-MJVQLWB');
                    `}
                </Script>
                <NextNProgress color="var(--primary-color)" options={{ showSpinner: false }} />
                <Component {...pageProps} />
              </Layout>
            </ThemeProvider>
          </SWRConfig>
        </PersistGate>
      ) : (
        <SWRConfig>
          <ThemeProvider theme={theme}>
            <Layout>
              <Script id="google-tag-manager" strategy="afterInteractive">
                {`
                      (function(w,d,s,l,i){w[l] = w[l] || [];w[l].push({'gtm.start':
                      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                      })(window,document,'script','dataLayer','GTM-MJVQLWB');
                    `}
              </Script>
              <NextNProgress color="var(--primary-color)" options={{ showSpinner: false }} />
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
        </SWRConfig>
      )}
    </Provider>
  )
}

export default MyApp
