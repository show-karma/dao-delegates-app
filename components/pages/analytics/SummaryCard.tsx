import { Box, Flex, Grid, GridItem, Heading, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FiInfo } from 'react-icons/fi';
import { IDaoSummary, SUMMARY_TOOLTIPS } from 'types/analytics';
import numbro from 'numbro';

interface SummaryCardProps {
  summary: IDaoSummary;
  isLoading: boolean;
}

/**
 * Component to display the DAO summary statistics in a card
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  isLoading,
}) => {
  const { theme } = useDAO();

  /**
   * Format a number value with numbro
   */
  const formatNumber = (value: number) => {
    return numbro(value).format({
      average: true,
      mantissa: 1,
      abbreviations: {
        thousand: 'K',
        million: 'M',
        billion: 'B',
      },
    });
  };

  /**
   * Format a percentage value
   */
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Format a string value that represents a number (like voting power)
   */
  const formatStringNumber = (value: string) => {
    return numbro(Number(value)).format({
      average: true,
      mantissa: 1,
      abbreviations: {
        thousand: 'K',
        million: 'M',
        billion: 'B',
      },
    });
  };

  /**
   * Render a summary stat item with a label and value
   */
  const renderStat = (label: string, value: string | number, tooltipText: string) => {
    return (
      <Box>
        <Flex alignItems="center" mb={1}>
          <Text fontSize="sm" color={theme.card.text.secondary} mr={1}>
            {label}
          </Text>
          <Tooltip label={tooltipText} placement="top" hasArrow>
            <Box color={theme.card.text.secondary} cursor="help">
              <FiInfo size={12} />
            </Box>
          </Tooltip>
        </Flex>
        {isLoading ? (
          <Skeleton height="24px" width="80px" />
        ) : (
          <Text fontSize="lg" fontWeight="bold" color={theme.text}>
            {value}
          </Text>
        )}
      </Box>
    );
  };

  return (
    <Box
      bg={theme.card.background}
      borderRadius="lg"
      p={6}
      boxShadow="md"
      height="100%"
      borderWidth="1px"
      borderColor={theme.card.border}
    >
      <Flex direction="column" height="100%">
        <Heading size="md" color={theme.title} mb={6}>
          DAO Summary Statistics
        </Heading>

        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <GridItem>
            {renderStat(
              'Weeks Analyzed',
              summary.totalWeeksAnalyzed,
              SUMMARY_TOOLTIPS.totalWeeksAnalyzed
            )}
          </GridItem>
          <GridItem>
            {renderStat(
              'Avg. Votes Per Week',
              formatNumber(summary.averageVotesPerWeek),
              SUMMARY_TOOLTIPS.averageVotesPerWeek
            )}
          </GridItem>
          <GridItem>
            {renderStat(
              'Avg. Voting Power Used',
              formatStringNumber(summary.averageVotingPowerUsed),
              SUMMARY_TOOLTIPS.averageVotingPowerUsed
            )}
          </GridItem>
          <GridItem>
            {renderStat(
              'Avg. Active Delegates',
              formatNumber(summary.averageActiveDelegates),
              SUMMARY_TOOLTIPS.averageActiveDelegates
            )}
          </GridItem>
          <GridItem>
            {renderStat(
              'Avg. Unique Voters',
              formatNumber(summary.averageUniqueVoters),
              SUMMARY_TOOLTIPS.averageUniqueVoters
            )}
          </GridItem>
          <GridItem>
            {renderStat(
              'Avg. VP Usage',
              formatPercentage(summary.averageVpUsagePercentage),
              SUMMARY_TOOLTIPS.averageVpUsagePercentage
            )}
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
}; 