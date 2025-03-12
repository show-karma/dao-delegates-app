import { DelegateCompensationAdminDelegatesVersioning } from 'components/pages/delegate-compensation/Admin/Delegates';
import { DelegateCompensationAdminContainer } from 'containers/delegate-compensation-admin';
import { DAOProvider } from 'contexts/dao';
import { daosDictionary } from 'helpers';
import { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
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

  return {
    props: {
      dao: site,
      delegateAddress: delegateAddress || null,
    },
  };
};

interface IFAQ {
  dao: string;
  delegateAddress: string | null;
}

const DelegateCompesationAdminPage = ({ dao, delegateAddress }: IFAQ) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
    <DelegateCompensationAdminContainer>
      <DelegateCompensationAdminDelegatesVersioning shouldShowDelegate="dropdown" />
    </DelegateCompensationAdminContainer>
  </DAOProvider>
);

export default DelegateCompesationAdminPage;
