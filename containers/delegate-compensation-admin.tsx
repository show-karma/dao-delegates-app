/* eslint-disable no-console */
import {
  DelegatesProvider,
  GovernanceVotesProvider,
  ProxyProvider,
  useDAO,
  WalletProvider,
} from 'contexts';
import { MainLayout } from 'layouts';
import Head from 'next/head';
import React from 'react';
import { Flex } from '@chakra-ui/react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { HeaderHat } from 'components';
import { DelegateCompensationProvider } from 'contexts/delegateCompensation';
import { useRouter } from 'next/router';
import { getMonthName } from 'utils/getMonthName';

const RainbowWrapper = dynamic(() =>
  import('components').then(module => module.RainbowWrapper)
);

const AuthProvider = dynamic(() =>
  import('contexts/auth').then(module => module.AuthProvider)
);

const HandlesProvider = dynamic(() =>
  import('contexts/handles').then(module => module.HandlesProvider)
);

interface IDelegateCompensationAdminContainer {
  user?: string;
  shouldOpenDelegateToAnyone?: boolean;
  children: React.ReactNode;
  customMetatagsInfo?: {
    type: 'delegate-stats' | 'forum-activity';
    delegateName?: string;
    delegateAddress: string;
  };
}

interface IMetatags {
  title: string;
  description: string;
  image: string;
  url: string;
}

const metatags = (
  delegateName: string,
  month: string,
  year: string,
  delegateAddress: string,
  dao: string
): {
  delegateStats: IMetatags;
  forumActivity: IMetatags;
} => ({
  delegateStats: {
    title: `${delegateName} ${
      dao.charAt(0).toUpperCase() + dao.slice(1)
    } DAO Governance Stats | ${month} ${year}`,
    description: `Explore ${delegateName}'s ${
      dao.charAt(0).toUpperCase() + dao.slice(1)
    } governance stats and activity for ${month} ${year}`,
    image: `https://${dao}.karmahq.xyz/api/${dao}/delegate-compensation-stats?address=${delegateAddress}&month=${month}&year=${year}`,
    url: `https://${dao}.karmahq.xyz/delegate-compensation/delegate/${delegateAddress}?month=${month}&year=${year}`,
  },
  forumActivity: {
    title: `${delegateName} ${
      dao.charAt(0).toUpperCase() + dao.slice(1)
    } DAO Forum Activity | ${month} ${year}`,
    description: `Explore ${delegateName}'s ${
      dao.charAt(0).toUpperCase() + dao.slice(1)
    } forum activity for ${month} ${year}`,
    image: `https://${dao}.karmahq.xyz/api/${dao}/delegate-compensation-forum-activity?address=${delegateAddress}&month=${month}&year=${year}`,
    url: `https://${dao}.karmahq.xyz/delegate-compensation/delegate/${delegateAddress}?month=${month}&year=${year}`,
  },
});

export const DelegateCompensationAdminContainer: React.FC<
  IDelegateCompensationAdminContainer
> = ({ user, shouldOpenDelegateToAnyone, children, customMetatagsInfo }) => {
  const { daoInfo, theme } = useDAO();
  const { config } = daoInfo;

  const router = useRouter();
  const queryString = router.asPath.split('?')[1] || undefined;

  // Extract month parameter with a fallback
  const monthMatch = queryString?.match(/(?<=month=)[^&]*/i);

  // Get the numeric month (0-11)
  const month = monthMatch
    ? monthMatch[0]
    : getMonthName(new Date().getMonth().toString());

  // Extract year parameter with a fallback
  const yearMatch = queryString?.match(/(?<=year=)[^&]*/i);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  const dao = daoInfo.config.DAO;

  let customMetatags = null;

  if (customMetatagsInfo?.type) {
    customMetatags = metatags(
      customMetatagsInfo?.delegateName || '',
      month,
      year,
      customMetatagsInfo?.delegateAddress || '',
      dao
    );
    if (customMetatagsInfo?.type === 'delegate-stats') {
      customMetatags = customMetatags?.delegateStats;
    } else {
      customMetatags = customMetatags?.forumActivity;
    }
  }

  console.log(router, queryString, customMetatagsInfo);

  return (
    <>
      <Head>
        <title>
          {customMetatags?.title ||
            `${config.DAO} Delegate Compensation Dashboard`}
        </title>
        <meta
          name="description"
          content={customMetatags?.description || config.METATAGS.DESCRIPTION}
        />

        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={customMetatags?.url || config.METATAGS.URL}
          key="ogurl"
        />
        <meta
          property="og:image"
          content={customMetatags?.image || config.METATAGS.IMAGE_DISCORD}
          key="ogimage"
        />
        <meta
          property="og:site_name"
          content={
            customMetatags?.title ||
            `${config.DAO} Delegate Compensation Dashboard`
          }
          key="ogsitename"
        />
        <meta
          property="og:title"
          content={
            customMetatags?.title ||
            `${config.DAO} Delegate Compensation Dashboard`
          }
          key="ogtitle"
        />
        <meta
          property="og:description"
          content={customMetatags?.description || config.METATAGS.DESCRIPTION}
          key="ogdesc"
        />
        <link rel="icon" href={config.METATAGS.FAVICON} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content={customMetatags?.url || config.METATAGS.URL}
        />
        <meta
          property="twitter:title"
          content={customMetatags?.description || config.METATAGS.DESCRIPTION}
        />
        <meta
          property="twitter:description"
          content={customMetatags?.description || config.METATAGS.DESCRIPTION}
        />
        <meta
          property="twitter:image"
          content={customMetatags?.image || config.METATAGS.IMAGE_TWITTER}
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
      <RainbowWrapper>
        <DelegatesProvider>
          <WalletProvider>
            <AuthProvider>
              <GovernanceVotesProvider>
                <ProxyProvider>
                  <HandlesProvider>
                    <DelegateCompensationProvider>
                      <Flex
                        w="full"
                        flexDir="column"
                        align="center"
                        background={theme.secondBg || theme.bodyBg}
                      >
                        <HeaderHat
                          shouldOpenDelegateToAnyone={
                            shouldOpenDelegateToAnyone
                          }
                        />
                        <MainLayout w="full">{children}</MainLayout>
                      </Flex>
                    </DelegateCompensationProvider>
                  </HandlesProvider>
                </ProxyProvider>
              </GovernanceVotesProvider>
            </AuthProvider>
          </WalletProvider>
        </DelegatesProvider>
      </RainbowWrapper>
    </>
  );
};
