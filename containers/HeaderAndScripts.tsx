import { useDAO } from 'contexts';
import Head from 'next/head';
import Script from 'next/script';

export const HeaderAndScripts = () => {
  const { daoInfo } = useDAO();
  const { config } = daoInfo;
  return (
    <>
      <Head>
        <title>{config.METATAGS.TITLE}</title>
        <meta name="description" content={config.METATAGS.DESCRIPTION} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={config.METATAGS.URL} key="ogurl" />
        <meta
          property="og:image"
          content={config.METATAGS.IMAGE_DISCORD}
          key="ogimage"
        />
        <meta
          property="og:site_name"
          content={`Karma - ${config.DAO} delegate dashboard`}
          key="ogsitename"
        />
        <meta
          property="og:title"
          content={`Active delegates of ${config.DAO}`}
          key="ogtitle"
        />
        <meta
          property="og:description"
          content={config.METATAGS.DESCRIPTION}
          key="ogdesc"
        />
        <link rel="icon" href={config.METATAGS.FAVICON} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={config.METATAGS.URL} />
        <meta property="twitter:title" content={config.METATAGS.DESCRIPTION} />
        <meta
          property="twitter:description"
          content={config.METATAGS.DESCRIPTION}
        />
        <meta
          property="twitter:image"
          content={config.METATAGS.IMAGE_TWITTER}
        />
      </Head>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${config.DAO_GTAG}`}
        onLoad={() => console.log('GTAG code setup')}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onLoad={() => console.log('Google-Analytics code setup')}
      >
        {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
  
                gtag('config', '${config.DAO_GTAG}');`}
      </Script>
    </>
  );
};
