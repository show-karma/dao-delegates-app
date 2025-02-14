import { DAOProvider } from 'contexts';
import DelegateOraclePage from 'components/pages/delegate-oracle';
import { ParsedUrlQuery } from 'querystring';
import { GetStaticPaths, GetStaticProps } from 'next';
import { daosDictionary } from 'helpers';
import { oracleSettings } from 'utils/oracle';
import { DefaultContainer } from 'containers/default';

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
  const daosWithOracle = oracleSettings.daos;
  if (!dao || !daosWithOracle.includes(dao)) {
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

const DelegateOracleRoute = ({ dao }: IFAQ) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
    <DefaultContainer>
      <DelegateOraclePage />
    </DefaultContainer>
  </DAOProvider>
);

export default DelegateOracleRoute;
