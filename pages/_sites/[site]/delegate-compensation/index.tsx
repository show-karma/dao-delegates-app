import { DelegateCompensationContainer } from 'containers/delegate-compensation';
import { DAOProvider } from 'contexts/dao';
import { daosDictionary } from 'helpers';
import { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';

interface PathProps extends ParsedUrlQuery {
  site: string;
}

interface FAQProps {
  dao: string;
  month?: string | null;
  year?: string | null;
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
    props: {
      dao: site,
    },
  };
};

interface IFAQ {
  dao: string;
}

const DelegateCompensationPage = ({ dao }: IFAQ) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false}>
    <DelegateCompensationContainer />
  </DAOProvider>
);

export default DelegateCompensationPage;
