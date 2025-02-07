import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useDAO, useDelegates } from 'contexts';
import { FC, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ScriptableContext,
  ChartOptions,
  ChartData,
  TimeScale,
} from 'chart.js';
import axios from 'axios';
import { formatNumber } from 'utils';
import dayjs from 'dayjs';
import { InfoIcon } from 'components/Icons';
import utc from 'dayjs/plugin/utc';
import 'chartjs-adapter-moment';

dayjs.extend(utc);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale
);

interface IAPIData {
  balance: number;
  timestamp: number;
}

const defaultLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

const defaultData = [1, 4, 2, 8];

interface IChartComponentProps {
  isLoading: boolean;
  options: ChartOptions<'line'>;
  data: ChartData<'line'>;
  hasError: boolean;
}

const ChartComponent: FC<IChartComponentProps> = ({
  data,
  isLoading,
  options,
  hasError,
}) => {
  const { theme } = useDAO();
  if (isLoading) {
    return (
      <Flex
        w={{ base: 'full', sm: '400px' }}
        h="200px"
        align="center"
        justify="center"
        position="relative"
      >
        <Flex
          top="0"
          right="0"
          position="absolute"
          w="100%"
          h="100%"
          align="center"
          justify="center"
        >
          <Spinner
            position="absolute"
            zIndex="10000"
            color={theme.modal.votingHistory.headline}
          />
          <Flex
            bg="rgba(217, 217, 217, 0.05)"
            w="100%"
            h="100%"
            backdropFilter="blur(15px)"
            position="absolute"
          />
        </Flex>
        <Line options={options} data={data} />
      </Flex>
    );
  }

  if (hasError) {
    return (
      <Flex
        w={{ base: 'full', sm: '400px' }}
        h="200px"
        align="center"
        justify="center"
        position="relative"
      >
        <Flex
          top="0"
          right="0"
          position="absolute"
          w="100%"
          h="100%"
          align="center"
          justify="center"
          flexDir="column"
        >
          <Flex
            zIndex="10000"
            align="center"
            justify="center"
            flexDir="column"
            color={theme.modal.votingHistory.headline}
          >
            <InfoIcon w="10" h="10" />
            <Text
              textAlign="center"
              fontWeight="400"
              fontSize="14px"
              maxW="270px"
            >
              There is no delegation activity for this contributor yet.
            </Text>
          </Flex>
          <Flex
            bg="rgba(217, 217, 217, 0.05)"
            w="100%"
            h="100%"
            backdropFilter="blur(15px)"
            position="absolute"
          />
        </Flex>
        <Line options={options} data={data} />
      </Flex>
    );
  }

  return <Line options={options} data={data} />;
};

export const DelegatedVotesChanges: FC = () => {
  const { theme, daoInfo } = useDAO();
  const { profileSelected } = useDelegates();
  // const [data, setData] = useState<IAPIData[]>([]);
  const [labels, setLabels] = useState<string[]>(defaultLabels);
  const [dataset, setDataset] = useState<number[]>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Total',
        data: dataset,
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
            `${
              theme.modal.votingHistory.modules?.chart.openGradient ||
              'rgba(74, 85, 104, 0.5)'
            }`
          );
          gradient.addColorStop(
            1,
            `${
              theme.modal.votingHistory.modules?.chart.endGradient ||
              'rgba(74, 85, 104, 0.1)'
            }`
          );
          return gradient;
        },
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    animation: { duration: isLoading || hasError ? 0 : 1000 },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
    },
    color: 'red',
    scales: {
      // eslint-disable-next-line id-length
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
      // eslint-disable-next-line id-length
      x: {
        type: 'time',
        grid: {
          display: true,
          color: theme.modal.votingHistory.proposal.divider,
        },
        time: {
          parser: 'MM-DD-YY',
          unit: 'day',
          displayFormats: {
            day: 'MMM, YY',
          },
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
        },
      },
    },
    interaction: {},
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: false,
      },
      tooltip: {
        callbacks: {
          title(tooltipItems) {
            return dayjs(tooltipItems[0].label).format('MMMM DD, YYYY');
          },
        },
      },
      title: {
        display: false,
        text: '',
      },
    },
  };

  const setupDataset = (fetchedData: IAPIData[]) => {
    if (!fetchedData.length) {
      setLabels([]);
      setDataset([]);
      return;
    }
    const orderedData = fetchedData.sort(
      (itemA, itemB) => itemA.timestamp - itemB.timestamp
    );
    const formattedDays: string[] = [];
    orderedData.forEach(item => {
      formattedDays.push(
        dayjs(item.timestamp * 1000)
          .utc()
          .format('MM-DD-YY')
      );
    });

    setLabels(formattedDays);

    const orderedBalances: number[] = [];
    orderedData.forEach(item => {
      const formattedNumber = Math.floor(item.balance / 10 ** 18);
      orderedBalances.push(formattedNumber);
    });

    setDataset(orderedBalances);
  };

  const fetchData = async () => {
    try {
      setHasError(false);
      setIsLoading(true);
      const { data: fetchedData } = (
        await axios.get(
          `${process.env.NEXT_PUBLIC_KARMA_API}/dao/${daoInfo.config.DAO_KARMA_ID}/delegates/${profileSelected?.address}/voting-power-timeline`
        )
      ).data;
      const { timeline } = fetchedData;

      setupDataset(timeline);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (hasError) return null;

  return (
    <Flex borderRadius="md" flexDir="column" w="full">
      <Flex
        align="center"
        gap="20"
        bg={theme.modal.votingHistory.proposal.bg}
        px="6"
        py="4"
        borderTopRadius="md"
      >
        <Text
          color={theme.modal.buttons.navText}
          fontWeight="semibold"
          fontSize="md"
        >
          Delegated Votes -
          {` ${formatNumber(profileSelected?.delegatedVotes || 0)}`}
        </Text>
      </Flex>
      <Flex
        bg={`${theme.modal.votingHistory.proposal.bg}40`}
        borderBottomRadius="md"
        px="1.5"
        py="1"
        w="full"
      >
        <ChartComponent
          data={data}
          options={options}
          isLoading={isLoading}
          hasError={hasError}
        />
      </Flex>
    </Flex>
  );
};
