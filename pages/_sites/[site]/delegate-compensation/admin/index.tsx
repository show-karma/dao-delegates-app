import { DAOProvider } from 'contexts/dao';
import { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { daosDictionary } from 'helpers';
import { DelegateCompensationAdminContainer } from 'containers/delegate-compensation-admin';
import { DelegateCompensationAdmin } from 'components/pages/delegate-compensation/Admin';

interface PathProps extends ParsedUrlQuery {
  site: string;
}

interface FAQProps {
  dao: string;
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const paths = [{ params: { site: 'arbitrum' } }];

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<FAQProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error('No path parameters found');

  const { site } = params;

  const dao = daosDictionary[site];
  const daosWithCompensation = ['arbitrum'];
  if (!dao || !daosWithCompensation.includes(dao)) {
    return {
      notFound: true,
    };
  }

  return {
    props: { dao: site },
  };
};

interface IFAQ {
  dao: string;
}

const DelegateCompensationAdminPage = ({ dao }: IFAQ) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
    <DelegateCompensationAdminContainer>
      <DelegateCompensationAdmin />
    </DelegateCompensationAdminContainer>
  </DAOProvider>
);

export default DelegateCompensationAdminPage;
