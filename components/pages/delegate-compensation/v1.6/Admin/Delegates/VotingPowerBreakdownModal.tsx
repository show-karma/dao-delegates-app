import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Button,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
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
  ScriptableContext,
  Filler,
} from 'chart.js';
import { formatNumber } from 'utils';
import { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { VotingPowerBreakdown } from 'types';

dayjs.extend(utc);

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VotingPowerBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  votingPowerBreakdown: VotingPowerBreakdown[];
  votingPowerAverage: number;
}

export const VotingPowerBreakdownModal = ({
  isOpen,
  onClose,
  votingPowerBreakdown,
  votingPowerAverage,
}: VotingPowerBreakdownModalProps) => {
  const { theme } = useDAO();
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Function to get the date for a specific day of the month
  const getDateForDay = (dayOfMonth: number) => {
    const dateUTC = dayjs.utc(new Date(dayOfMonth * 1000));
    return dateUTC.format('MMM D, YYYY');
  };

  // Create array of objects with power and day for sorting
  const tableData = votingPowerBreakdown.map(data => ({
    power: data.amount,
    date: getDateForDay(data.date),
    timestamp: data.date,
  }));

  // Sort data in descending order by date
  const sortedTableData = [...tableData].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // Prepare data for the chart (keep original order for chart)
  const chartData = {
    labels: votingPowerBreakdown.map(data => getDateForDay(data.date)),
    datasets: [
      {
        fill: true,
        label: 'Total',
        data: votingPowerBreakdown.map(data => data.amount),
        borderColor:
          theme.modal.votingHistory.modules?.chart.point || '#4A5568',
        borderWidth: 2,
        pointBorderColor: theme.modal.votingHistory.modules?.chart.point,
        pointBackgroundColor: theme.modal.votingHistory.modules?.chart.point,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const { ctx } = context.chart;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(
            0,
            theme.modal.votingHistory.modules?.chart.openGradient ||
              'rgba(74, 85, 104, 0.5)'
          );
          gradient.addColorStop(
            1,
            theme.modal.votingHistory.modules?.chart.endGradient ||
              'rgba(74, 85, 104, 0.1)'
          );
          return gradient;
        },
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
    },
    scales: {
      y: {
        grid: {
          display: true,
          color: theme.modal.votingHistory.proposal.divider,
        },
        display: true,
        ticks: {
          callback: label => formatNumber(label as number),
        },
      },
      x: {
        grid: {
          display: true,
          color: theme.modal.votingHistory.proposal.divider,
        },
        ticks: {
          color: theme.modal.votingHistory.proposal.divider,
          autoSkip: true,
          autoSkipPadding: 10,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: false,
      },
      tooltip: {
        callbacks: {
          title(tooltipItems) {
            return tooltipItems[0].label;
          },
          label(context) {
            return `Voting Power: ${formatNumber(Number(context.raw))}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        bg={theme.compensation?.card.bg}
        textColor={theme.compensation?.card.text}
      >
        <ModalHeader>
          <Text fontSize="lg" fontWeight="bold">
            Voting Power Breakdown
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {/* Chart Section */}
          <Box
            mb={8}
            p={4}
            bg={theme.card.background}
            borderRadius="lg"
            h="400px"
          >
            <Line data={chartData} options={chartOptions} />
          </Box>

          {/* Table Section */}
          <Box overflowX="auto" bg={theme.card.background} borderRadius="lg">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color={theme.compensation?.card.text}>Date</Th>
                  <Th color={theme.compensation?.card.text} isNumeric>
                    Voting Power
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Show first 5 rows or all rows when expanded */}
                {(isTableExpanded
                  ? sortedTableData
                  : sortedTableData.slice(0, 5)
                ).map(({ power, date }) => (
                  <Tr key={date}>
                    <Td color={theme.compensation?.card.text}>{date}</Td>
                    <Td color={theme.compensation?.card.text} isNumeric>
                      {formatNumber(power)}
                    </Td>
                  </Tr>
                ))}
                {/* Show expand/collapse button if there are more than 5 rows */}
                {sortedTableData.length > 5 && (
                  <Tr>
                    <Td colSpan={2} textAlign="center" py={2}>
                      <Button
                        onClick={() => setIsTableExpanded(!isTableExpanded)}
                        size="sm"
                        variant="ghost"
                        color={theme.compensation?.card.text}
                      >
                        {isTableExpanded ? 'Show Less' : 'Show More'}
                      </Button>
                    </Td>
                  </Tr>
                )}
                {/* Average row */}
                <Tr>
                  <Td
                    color={theme.compensation?.card.text}
                    borderTop="2px solid"
                    borderTopColor={theme.compensation?.card.divider}
                    fontWeight="bold"
                  >
                    Average
                  </Td>
                  <Td
                    color={theme.compensation?.card.text}
                    borderTop="2px solid"
                    borderTopColor={theme.compensation?.card.divider}
                    fontWeight="bold"
                    isNumeric
                  >
                    {formatNumber(votingPowerAverage)}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
