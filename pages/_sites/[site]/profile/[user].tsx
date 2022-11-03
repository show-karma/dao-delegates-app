import { DAOContainer } from 'containers';
import { DAOProvider } from 'contexts';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { supportedDAOs } from 'resources';

interface PathProps extends ParsedUrlQuery {
  site: string;
  user: string;
}

interface IndexProps {
  dao: string;
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const paths = [{ params: { site: 'site123', user: 'user' } }];

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<IndexProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error('No path parameters found');

  const { site, user } = params;

  const dao = supportedDAOs[site];

  if (!dao) {
    return {
      notFound: true,
    };
  }

  return {
    props: { dao: site, user },
  };
};

interface IIndex {
  dao: string;
  user: string;
}

const User = ({ dao, user }: IIndex) => (
  <DAOProvider selectedDAO={dao}>
    <DAOContainer user={user} />
  </DAOProvider>
);

export default User;
