import { GetServerSideProps } from 'next';
import { DAOProvider } from 'contexts';
import { AnalyticsPage } from 'components/pages/analytics/AnalyticsPage';
import { MainLayout } from 'layouts';
import { DefaultContainer } from 'containers/default';

interface AnalyticsProps {
  daoName: string;
}

/**
 * Analytics page for the DAO (_sites version)
 */
const Analytics = ({ daoName }: AnalyticsProps) => (
  <DAOProvider selectedDAO={daoName} withPathname>
    <DefaultContainer>
      <MainLayout>
        <AnalyticsPage />
      </MainLayout>
    </DefaultContainer>
  </DAOProvider>
);

export const getServerSideProps: GetServerSideProps = async context => {
  const { site } = context.params || {};

  if (!site || typeof site !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      daoName: site,
    },
  };
};

export default Analytics;
