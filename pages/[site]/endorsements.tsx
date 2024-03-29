import { DAOProvider } from 'contexts/dao';
import { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { daosDictionary } from 'helpers';
import { EndorsementsContainer } from 'containers/endorsements';

interface PathProps extends ParsedUrlQuery {
  site: string;
}

interface IndexProps {
  dao: string;
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const paths = [{ params: { site: 'siteIndex' } }];

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<IndexProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error('No path parameters found');

  const { site } = params;

  const dao = daosDictionary[site];
  if (!dao) {
    return {
      notFound: true,
    };
  }

  return {
    props: { dao: site },
  };
};

interface IIndex {
  dao: string;
}

const DynamicEndorsements = ({ dao }: IIndex) => (
  <DAOProvider selectedDAO={dao} shouldFetchInfo={false} withPathname>
    <EndorsementsContainer />
  </DAOProvider>
);

export default DynamicEndorsements;
