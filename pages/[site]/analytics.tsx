import { GetServerSideProps } from 'next';
import { DAOProvider } from 'contexts';
import { AnalyticsPage } from 'components/pages/analytics/AnalyticsPage';
import { MainLayout } from 'layouts';

interface AnalyticsProps {
  daoName: string;
}

/**
 * Analytics page for the DAO
 */
const Analytics = ({ daoName }: AnalyticsProps) => (
  <DAOProvider selectedDAO={daoName} withPathname>
    <MainLayout>
      <AnalyticsPage />
    </MainLayout>
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
