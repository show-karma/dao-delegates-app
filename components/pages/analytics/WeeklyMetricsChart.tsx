import { Box, Flex, Heading, Text, useDisclosure } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { IWeeklyMetrics, WEEKLY_METRICS_TOOLTIPS } from 'types/analytics';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { FiInfo } from 'react-icons/fi';
import { useState } from 'react';
import moment from 'moment';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyMetricsChartProps {
  weeklyMetrics: IWeeklyMetrics[];
  isLoading: boolean;
}

/**
 * Component to display the weekly metrics in a chart
 */
export const WeeklyMetricsChart: React.FC<WeeklyMetricsChartProps> = ({
  weeklyMetrics,
  isLoading,
}) => {
  const { theme } = useDAO();
  const [activeMetric, setActiveMetric] = useState<keyof IWeeklyMetrics>('vpUsagePercentage');
  
  // Define the metrics to display and their labels
  const metricOptions: { value: keyof IWeeklyMetrics; label: string; tooltip: string }[] = [
    { value: 'totalVotingPower', label: 'Total Voting Power', tooltip: WEEKLY_METRICS_TOOLTIPS.totalVotingPower },
    { value: 'vpUsagePercentage', label: 'VP Usage', tooltip: WEEKLY_METRICS_TOOLTIPS.vpUsagePercentage },
    { value: 'quorumAmount', label: 'Quorum Amount', tooltip: WEEKLY_METRICS_TOOLTIPS.quorumAmount },
    { value: 'activeDelegates', label: 'Active Delegates', tooltip: WEEKLY_METRICS_TOOLTIPS.activeDelegates },
    { value: 'uniqueVoters', label: 'Unique Voters', tooltip: WEEKLY_METRICS_TOOLTIPS.uniqueVoters },
    { value: 'totalVotes', label: 'Total Votes', tooltip: WEEKLY_METRICS_TOOLTIPS.totalVotes },
    { value: 'activeProposals', label: 'Active Proposals', tooltip: WEEKLY_METRICS_TOOLTIPS.activeProposals },
  ];

  /**
   * Format a value based on its type
   */
  const formatValue = (value: any, metricType: keyof IWeeklyMetrics): string => {
    if (typeof value === 'undefined' || value === null) return 'N/A';
    
    // Format based on metric type
    if (metricType === 'vpUsagePercentage') {
      return `${Number(value).toFixed(1)}%`;
    } else if (
      metricType === 'totalVotingPower' ||
      metricType === 'quorumAmount' ||
      metricType === 'votingPowerUsed'
    ) {
      return Number(value).toLocaleString();
    } else {
      return value.toString();
    }
  };

  // Prepare chart data
  const chartData = {
    labels: weeklyMetrics.map(week => {
      // Format date as "Jan 1 - Jan 7, 2023"
      const startDate = moment(week.startDate).format('MMM D');
      const endDate = moment(week.endDate).format('MMM D, YYYY');
      return `${startDate} - ${endDate}`;
    }),
    datasets: (activeMetric === 'totalVotingPower' as keyof IWeeklyMetrics)
      ? [
          // Primary dataset - Total Voting Power
          {
            label: 'Total Voting Power',
            data: weeklyMetrics.map(week => Number(week.totalVotingPower)),
            borderColor: theme.branding,
            backgroundColor: `${theme.branding}80`, // Add transparency
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y',
          },
          // Secondary dataset - Voting Power Used
          {
            label: 'Voting Power Used',
            data: weeklyMetrics.map(week => Number(week.votingPowerUsed)),
            borderColor: '#FF9800', // Orange color for contrast
            backgroundColor: '#FF980080', // Semi-transparent orange
            borderDash: [5, 5], // Dashed line for visual distinction
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            yAxisID: 'y',
          }
        ]
      : [
          // Default single dataset for other metrics
          {
            label: metricOptions.find(option => option.value === activeMetric)?.label || '',
            data: weeklyMetrics.map(week => {
              // Handle string values that need to be converted to numbers
              if (
                activeMetric === 'totalVotingPower' ||
                activeMetric === 'quorumAmount' ||
                activeMetric === 'votingPowerUsed'
              ) {
                return Number(week[activeMetric]);
              }
              return week[activeMetric];
            }),
            borderColor: theme.branding,
            backgroundColor: `${theme.branding}80`, // Add transparency
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: activeMetric === 'totalVotingPower', // Only show legend for Total Voting Power chart
        labels: {
          color: theme.text,
          font: {
            size: 12,
          },
          padding: 15, // Add more padding between legend items
          usePointStyle: true, // Use point style for better visualization
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: theme.card.background,
        titleColor: theme.title,
        bodyColor: theme.text,
        borderColor: theme.card.border,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label || '';
          },
          label: (context) => {
            const dataIndex = context.dataIndex;
            const weekData = weeklyMetrics[dataIndex];
            
            // Create an array to hold all tooltip lines
            const tooltipLines = [];
            
            // When viewing Total Voting Power chart, handle both datasets
            if (activeMetric === 'totalVotingPower') {
              // Check which dataset this tooltip is for
              const isVotingPowerUsed = context.dataset.label === 'Voting Power Used';
              
              if (isVotingPowerUsed) {
                // This is the Voting Power Used dataset
                const vpUsed = formatValue(context.parsed.y, 'votingPowerUsed');
                tooltipLines.push(`Voting Power Used: ${vpUsed}`);
                
                // Also show Total Voting Power and Usage Percentage
                const totalVP = formatValue(weekData.totalVotingPower, 'totalVotingPower');
                const vpUsage = formatValue(weekData.vpUsagePercentage, 'vpUsagePercentage');
                tooltipLines.push(`Total Voting Power: ${totalVP}`);
                tooltipLines.push(`VP Usage: ${vpUsage}`);
              } else {
                // This is the Total Voting Power dataset
                const totalVP = formatValue(context.parsed.y, 'totalVotingPower');
                tooltipLines.push(`Total Voting Power: ${totalVP}`);
                
                // Also show Voting Power Used and Usage Percentage
                const vpUsed = formatValue(weekData.votingPowerUsed, 'votingPowerUsed');
                const vpUsage = formatValue(weekData.vpUsagePercentage, 'vpUsagePercentage');
                tooltipLines.push(`Voting Power Used: ${vpUsed}`);
                tooltipLines.push(`VP Usage: ${vpUsage}`);
              }
            } else {
              // For other metrics, show the primary metric first
              let primaryLabel = metricOptions.find(option => option.value === activeMetric)?.label || '';
              let primaryValue = formatValue(context.parsed.y, activeMetric);
              tooltipLines.push(`${primaryLabel}: ${primaryValue}`);
              
              // Add related metrics based on the active metric
              if (activeMetric === 'vpUsagePercentage') {
                // When viewing VP Usage %, also show Total Voting Power and Voting Power Used
                const totalVP = formatValue(weekData.totalVotingPower, 'totalVotingPower');
                const vpUsed = formatValue(weekData.votingPowerUsed, 'votingPowerUsed');
                tooltipLines.push(`Total Voting Power: ${totalVP}`);
                tooltipLines.push(`Voting Power Used: ${vpUsed}`);
              }
              else if (activeMetric === 'activeDelegates' || activeMetric === 'uniqueVoters') {
                // For delegate/voter metrics, show related participation metrics
                const totalVotes = formatValue(weekData.totalVotes, 'totalVotes');
                tooltipLines.push(`Total Votes: ${totalVotes}`);
                
                // Show active proposals count
                const activeProps = formatValue(weekData.activeProposals, 'activeProposals');
                tooltipLines.push(`Active Proposals: ${activeProps}`);
              }
              else if (activeMetric === 'activeProposals') {
                // When viewing Active Proposals, show related metrics
                const totalVotes = formatValue(weekData.totalVotes, 'totalVotes');
                const uniqueVoters = formatValue(weekData.uniqueVoters, 'uniqueVoters');
                tooltipLines.push(`Total Votes: ${totalVotes}`);
                tooltipLines.push(`Unique Voters: ${uniqueVoters}`);
              }
            }
            
            return tooltipLines;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: `${theme.card.border}40`, // Lighter grid lines
        },
        ticks: {
          color: theme.card.text.secondary,
        },
      },
      y: {
        grid: {
          color: `${theme.card.border}40`, // Lighter grid lines
        },
        ticks: {
          color: theme.card.text.secondary,
          callback: (value) => formatValue(value, activeMetric),
        },
        beginAtZero: true,
      },
    },
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
        <Heading size="md" color={theme.title} mb={4}>
          Weekly Metrics
        </Heading>

        {/* Metric selector */}
        <Flex mb={6} flexWrap="wrap" gap={2}>
          {metricOptions.map((option) => (
            <Box
              key={option.value}
              as="button"
              px={3}
              py={2}
              borderRadius="md"
              bg={activeMetric === option.value ? theme.branding : 'transparent'}
              color={activeMetric === option.value ? 'white' : theme.text}
              borderWidth="1px"
              borderColor={activeMetric === option.value ? theme.branding : theme.card.border}
              onClick={() => setActiveMetric(option.value)}
              _hover={{
                bg: activeMetric === option.value ? theme.branding : `${theme.card.border}30`,
              }}
              title={option.tooltip}
            >
              {option.label}
            </Box>
          ))}
        </Flex>

        {/* Chart */}
        <Box flex={1} minHeight="300px">
          {isLoading ? (
            <Flex
              height="100%"
              alignItems="center"
              justifyContent="center"
              color={theme.card.text.secondary}
            >
              <Text>Loading chart data...</Text>
            </Flex>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </Box>

        {/* Tooltip explanation */}
        <Box mt={4} p={3} bg={`${theme.card.border}20`} borderRadius="md">
          <Flex alignItems="center" mb={2}>
            <FiInfo size={16} color={theme.card.text.secondary} />
            <Text ml={2} fontWeight="medium" color={theme.title}>
              About this metric
            </Text>
          </Flex>
          <Text fontSize="sm" color={theme.card.text.secondary}>
            {activeMetric === 'totalVotingPower' ? (
              <>
                {WEEKLY_METRICS_TOOLTIPS.totalVotingPower}
                <br /><br />
                <strong>Note:</strong> This chart also displays Voting Power Used (orange dashed line) to show how much of the total voting power is being utilized.
              </>
            ) : (
              metricOptions.find(option => option.value === activeMetric)?.tooltip
            )}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}; 