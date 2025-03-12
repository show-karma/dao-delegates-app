import { DelegateCompensationAdminForumActivityVersioning } from 'components/pages/delegate-compensation/Admin/ForumActivity';
import { DelegateCompensationAdminContainer } from 'containers/delegate-compensation-admin';
import { DAOProvider } from 'contexts/dao';
import { daosDictionary } from 'helpers';
import { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { IDelegateFromAPI } from 'types';
import { compensation } from 'utils/compensation';
import { getAllDelegates } from 'utils/delegate-compensation/getAllDelegates';

interface PathProps extends ParsedUrlQuery {
  site: string;
  delegateAddress: string;
}

interface FAQProps {
  dao: string;
  delegateAddress: string | null;
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const { daos } = compensation;

  const paths = await Promise.all(
    daos.map(async dao => {
      const allDelegates = await getAllDelegates(dao);
      return allDelegates.map(delegate => ({
        params: { site: dao, delegateAddress: delegate },
      }));
    })
  );
  const flattenedPaths = paths.flat();

  return {
    paths: flattenedPaths,
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

const DelegateCompesationForumActivityPage = ({
  dao,
  delegateAddress,
}: IFAQ) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
    <DelegateCompensationAdminContainer>
      <DelegateCompensationAdminForumActivityVersioning
        delegateAddress={delegateAddress}
      />
    </DelegateCompensationAdminContainer>
  </DAOProvider>
);

export default DelegateCompesationForumActivityPage;
