import { DelegateCompensationAdminDelegatesVersioning } from 'components/pages/delegate-compensation/Admin/Delegates';
import { DelegateCompensationAdminContainer } from 'containers/delegate-compensation-admin';
import { DAOProvider } from 'contexts/dao';
import { daosDictionary } from 'helpers';
import { GetServerSideProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { IDelegateFromAPI } from 'types';
import { compensation } from 'utils/compensation';

interface PathProps extends ParsedUrlQuery {
  site: string;
  delegateAddress: string;
  delegateName: string;
}

interface DelegateCompensationProps {
  dao: string;
  delegateAddress: string | null;
  delegateName: string | null;
}

export const getServerSidePaths = async () => {
  const paths = [
    {
      params: {
        site: 'arbitrum',
        delegateAddress: '0x0000000000000000000000000000000000000000',
        delegateName: '',
      },
    },
  ];

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getServerSideProps: GetServerSideProps<
  DelegateCompensationProps,
  PathProps
> = async context => {
  const { params, query } = context;
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
      serverSideMonth: query?.month || null,
      serverSideYear: query?.year || null,
    },
  };
};

interface DelegateCompensationAdminDelegatesProps {
  dao: string;
  delegateAddress: string | null;
  delegateName: string | null;
  serverSideMonth: string | null;
  serverSideYear: string | null;
}

const DelegateCompensationAdminDelegatesPage = ({
  dao,
  delegateAddress,
  delegateName,
  serverSideMonth,
  serverSideYear,
}: DelegateCompensationAdminDelegatesProps) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
    <DelegateCompensationAdminContainer
      customMetatagsInfo={{
        type: 'delegate-stats',
        delegateName: delegateName || '',
        delegateAddress: delegateAddress || '',
        serverSideMonth: serverSideMonth || undefined,
        serverSideYear: serverSideYear || undefined,
      }}
    >
      <DelegateCompensationAdminDelegatesVersioning
        isPublic
        shouldShowDelegate="block"
      />
    </DelegateCompensationAdminContainer>
  </DAOProvider>
);

export default DelegateCompensationAdminDelegatesPage;
