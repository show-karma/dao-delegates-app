import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useAnalytics } from 'hooks';
import moment from 'moment';
import { CirculatingSupplyCard } from './CirculatingSupplyCard';
import { SummaryCard } from './SummaryCard';
import { WeeklyMetricsChart } from './WeeklyMetricsChart';

/**
 * Main component for the DAO Analytics page
 */
export const AnalyticsPage: React.FC = () => {
  const { theme, daoInfo, selectedDAO } = useDAO();
  const { data, isLoading, error } = useAnalytics(selectedDAO);

  // Get the DAO display name from the config or fallback to the selectedDAO
  const daoDisplayName =
    daoInfo?.config?.DAO ||
    selectedDAO.charAt(0).toUpperCase() + selectedDAO.slice(1);

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" color={theme.title} mb={2}>
          {daoDisplayName} DAO Analytics
        </Heading>
        {data?.lastUpdated && (
          <Text color={theme.card.text.secondary} fontSize="sm">
            Last updated:{' '}
            {moment(data.lastUpdated).format('MMMM D, YYYY [at] h:mm A')}
          </Text>
        )}
      </Box>

      {error ? (
        <Box
          p={6}
          bg={theme.card.background}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={theme.card.border}
        >
          <Heading size="md" color="red.500" mb={2}>
            Error Loading Data
          </Heading>
          <Text color={theme.text}>
            There was an error loading the analytics data. Please try again
            later.
          </Text>
        </Box>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={6}
          mb={8}
        >
          {/* Circulating Supply Card */}
          <GridItem>
            <CirculatingSupplyCard
              circulatingSupply={data?.circulatingSupply || 0}
              isLoading={isLoading}
            />
          </GridItem>

          {/* Summary Card - spans 2 columns on larger screens */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <SummaryCard
              summary={
                data?.summary || {
                  totalWeeksAnalyzed: 0,
                  averageVotesPerWeek: 0,
                  averageVotingPowerUsed: '0',
                  averageActiveDelegates: 0,
                  averageUniqueVoters: 0,
                  averageVpUsagePercentage: 0,
                }
              }
              isLoading={isLoading}
            />
          </GridItem>
        </Grid>
      )}

      {/* Weekly Metrics Chart - full width */}
      {!error && (
        <Box mb={8}>
          <WeeklyMetricsChart
            weeklyMetrics={data?.weeklyMetrics || []}
            isLoading={isLoading}
          />
        </Box>
      )}

      {/* Additional information section */}
      <Box
        p={6}
        bg={theme.card.background}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={theme.card.border}
      >
        <Heading size="md" color={theme.title} mb={4}>
          About DAO Analytics
        </Heading>
        <Text color={theme.text} mb={4}>
          This dashboard provides insights into the governance activities of the{' '}
          {daoDisplayName} DAO. The data is collected and analyzed on a weekly
          basis to help understand participation trends, delegate activities,
          and overall governance health.
        </Text>
        <Heading size="sm" color={theme.title} mb={2}>
          Data Definitions
        </Heading>
        <Text color={theme.text} fontSize="sm">
          <strong>Voting Power (VP):</strong> The total amount of voting power
          available in the DAO, representing the maximum possible influence all
          token holders could exert.
          <br />
          <br />
          <strong>VP Usage:</strong> The percentage of total voting power that
          has been used in voting (0-100%). This metric helps gauge overall
          engagement relative to the total possible participation.
          <br />
          <br />
          <strong>Active Delegates:</strong> The number of delegates who have
          been active during the reporting period. This indicates how many
          delegates are actively participating in governance.
          <br />
          <br />
          <strong>Unique Voters:</strong> The number of unique addresses that
          have participated in voting. This helps distinguish between total
          votes and the actual number of participants.
        </Text>
      </Box>
    </Container>
  );
};
