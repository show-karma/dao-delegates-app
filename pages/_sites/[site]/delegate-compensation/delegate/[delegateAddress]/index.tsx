import { DelegateCompensationAdminDelegatesVersioning } from 'components/pages/delegate-compensation/Admin/Delegates';
import { DelegateCompensationAdminContainer } from 'containers/delegate-compensation-admin';
import { DAOProvider } from 'contexts/dao';
import { daosDictionary } from 'helpers';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import { IDelegateFromAPI } from 'types';
import { compensation } from 'utils/compensation';
import { getMonthName } from 'utils/getMonthName';

interface PathProps extends ParsedUrlQuery {
  site: string;
  delegateAddress: string;
}

interface FAQProps {
  dao: string;
  delegateAddress: string | null;
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const paths = [
    {
      params: {
        site: 'arbitrum',
        delegateAddress: '0x0000000000000000000000000000000000000000',
      },
    },
  ];

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<FAQProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error('No path parameters found');

  const { site, delegateAddress } = params;

  const dao = daosDictionary[site];
  const daosWithCompensation = compensation.daos;
  if (!dao || !daosWithCompensation.includes(dao)) {
    return {
      notFound: true,
    };
  }

  // Fetch delegate name from API
  let delegateName = null;
  try {
    // Using fetch to get delegate information
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_KARMA_API}/dao/find-delegate?dao=${dao}&user=${delegateAddress}`
    );

    // Check if the response is successful
    if (response.ok) {
      const data = await response.json();
      const delegate = data?.data?.delegate as IDelegateFromAPI;
      // Extract delegate name from response if available
      delegateName = delegate?.realName || delegate?.ensName || null;
    } else {
      console.error('Failed to fetch delegate name:', response.statusText);
    }
  } catch (error) {
    // Log error but don't fail the build process
    console.error('Error fetching delegate name:', error);
  }

  return {
    props: {
      dao: site,
      delegateAddress: delegateAddress || null,
      delegateName: delegateName || null,
    },
  };
};

interface IFAQ {
  dao: string;
  delegateAddress: string;
  delegateName: string;
}

const DelegateCompesationAdminPage = ({
  dao,
  delegateAddress,
  delegateName,
}: IFAQ) => {
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

  const daoCapitalized = dao.charAt(0).toUpperCase() + dao.slice(1);

  return (
    <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
      <DelegateCompensationAdminContainer
        customMetatags={{
          title: `${delegateName} ${daoCapitalized} DAO Governance Stats | ${month} ${year}`,
          description: `Explore ${delegateName}'s ${daoCapitalized} governance stats and activity for ${month} ${year}`,
          image: `https://${dao}.karmahq.xyz/api/${dao}/delegate-compensation-stats?address=${delegateAddress}&month=${month}&year=${year}`,
          url: `https://${dao}.karmahq.xyz/delegate-compensation/delegate/${delegateAddress}?month=${month}&year=${year}`,
        }}
      >
        <DelegateCompensationAdminDelegatesVersioning
          isPublic
          shouldShowDelegate="block"
        />
      </DelegateCompensationAdminContainer>
    </DAOProvider>
  );
};

export default DelegateCompesationAdminPage;
