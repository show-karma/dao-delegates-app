import {
  Box,
  Divider,
  Flex,
  Spinner,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import {
  ArcElement,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from 'chart.js';
import { InfoIcon } from 'components/Icons';
import { useDAO, useVotes } from 'contexts';
import { FC, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { formatNumber, formatNumberPercentage } from 'utils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IDoughnutComponentProps {
  isLoading: boolean;
  options: ChartOptions<'doughnut'>;
  data: ChartData<'doughnut'>;
  hasError: boolean;
}

const ChartComponent: FC<IDoughnutComponentProps> = ({
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
        h="300px"
        align="center"
        justify="center"
        position="relative"
        zIndex="1"
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
        <Doughnut
          options={{
            ...options,
            responsive: false,
          }}
          data={data}
          width={150}
          height={150}
        />
      </Flex>
    );
  }

  if (hasError) {
    return (
      <Flex
        w={{ base: 'full', sm: '400px' }}
        h="300px"
        align="center"
        justify="center"
        position="relative"
        zIndex="2"
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
              There is no voting activity for this contributor yet.
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
        <Doughnut options={options} data={data} />
      </Flex>
    );
  }

  return (
    <Flex zIndex="1" py="6">
      <Doughnut options={options} data={data} />
    </Flex>
  );
};

const defaultLabels = ['Yes', 'No', 'Abstain', 'Multiple', 'Other'];
const defaultData = [1, 4, 2, 8, 6];
const defaultBgColors = ['#02E2AC', '#CA4444', '#DFDFDF', '#2980b9', '#FFF7AE'];

export const OffChainVotingBreakdown: FC = () => {
  const { theme } = useDAO();
  const [labels, setLabels] = useState<string[]>(defaultLabels);
  const [dataset, setDataset] = useState<number[]>(defaultData);
  const [backgroundColor, setBackgroundColor] =
    useState<string[]>(defaultBgColors);
  const {
    offChainVoteBreakdown: voteBreakdown,
    isOffChainVoteBreakdownLoading: isLoading,
    isOffChainVoteBreakdownError: hasError,
  } = useVotes();

  const dataConfig: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        label: 'Votes',
        data: dataset,
        backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 1,
      },
    ],
  };

  // ssr-friendly media query with fallback
  const [isMobile] = useMediaQuery('(max-width: 990px)', {
    ssr: false,
    fallback: false, // return false on the server, and re-evaluate on the client side
  });

  const options: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: {},
    cutout: '70%',
    animation: { duration: isLoading || hasError ? 0 : 1000 },
    layout: {
      padding: isMobile ? 10 : 0,
    },

    plugins: {
      tooltip: {
        enabled: true,
        mode: 'nearest',
        callbacks: {
          label(tooltipItem) {
            const percentage = (
              (tooltipItem.parsed /
                tooltipItem.dataset.data.reduce(
                  (actual, previous) => actual + previous
                )) *
              100
            ).toFixed(2);
            return `${formatNumberPercentage(percentage)}, ${
              tooltipItem.parsed
            } votes`;
          },
        },
      },
      legend: {
        position: 'left' as const,
        display: false,
      },
      title: {
        display: false,
        text: '',
      },
    },
  };

  const setupDataset = () => {
    if (!voteBreakdown) {
      setLabels(defaultLabels);
      setDataset(defaultData);
      return;
    }
    const { positiveCount, negativeCount, abstainCount, multiple, other } =
      voteBreakdown;

    const labelsDictionary: {
      [key: string]: number;
    } = {
      Yes: positiveCount,
      No: negativeCount,
      Abstain: abstainCount,
      Multiple: multiple,
      Other: other,
    };

    // const defaultLabels = ['Yes', 'No', 'Abstain', 'Multiple', 'Other'];
    const newDataset: number[] = [];
    const newLabels: string[] = [];
    const newBgColors: string[] = [];
    defaultLabels.forEach((label, index) => {
      if (labelsDictionary[label] !== 0) {
        newLabels.push(label);
        newDataset.push(labelsDictionary[label]);
        newBgColors.push(defaultBgColors[index]);
      }
    });

    setLabels(newLabels);
    setBackgroundColor(newBgColors);
    setDataset(newDataset);
  };

  useEffect(() => {
    setupDataset();
  }, [voteBreakdown]);

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
          Snapshot Voting Breakdown
        </Text>
      </Flex>
      <Flex
        bg={`${theme.modal.votingHistory.proposal.bg}40`}
        borderBottomRadius="md"
        flexDir="column"
      >
        <Flex
          position="relative"
          alignItems="center"
          justifyContent="center"
          w="full"
          px="1.5"
        >
          <ChartComponent
            data={dataConfig}
            options={options}
            isLoading={isLoading}
            hasError={hasError}
          />
          <Flex
            position="absolute"
            alignItems="center"
            justifyContent="center"
            zIndex="0"
            width="full"
            height="full"
            flexDir="column"
            fontFamily="Poppins"
            textAlign="center"
            mt={{ base: '12px' }}
            color={theme.modal.votingHistory.proposal.title}
          >
            <Text fontWeight="600" fontSize="sm">
              Total Votes
            </Text>
            {voteBreakdown && (
              <Text fontWeight="700" fontSize="18px">
                {formatNumber(voteBreakdown.totalVotes)}
              </Text>
            )}
          </Flex>
        </Flex>
        {!hasError && !isLoading && (
          <>
            <Divider h="1px" />
            <Flex
              flexDir="row"
              flexWrap="wrap"
              align="center"
              justify="flex-start"
              pt="4"
              pb="3"
            >
              {dataset.map((data, index) => (
                <Flex
                  width="50%"
                  align="center"
                  justify="center"
                  gap="2"
                  justifyContent="flex-start"
                  pl="10"
                  key={+index}
                  color={theme.modal.votingHistory.proposal.title}
                >
                  <Box
                    borderRadius="full"
                    boxSize="9px"
                    backgroundColor={backgroundColor[index]}
                  />
                  <Text fontSize="sm" w="max-content">
                    <Text as="b">{labels[index]}</Text>, {data}{' '}
                    {data > 1 ? 'votes' : 'vote'}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};
