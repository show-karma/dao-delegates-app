import { Flex } from '@chakra-ui/react';
import { useDelegates } from 'contexts';
import { formatNumber, formatNumberPercentage } from 'utils';
import { FC } from 'react';
import { StatCard } from '../Stats/StatCard';

interface RewardStatsRowProps {
  participationRate?: number;
  oracleScore?: number;
}

export const RewardStatsRow: FC<RewardStatsRowProps> = ({
  participationRate,
  oracleScore,
}) => {
  const { profileSelected } = useDelegates();

  // Define the stats for the reward details cards
  const rewardStats = [
    {
      title: 'Delegated Votes',
      amount: profileSelected?.delegatedVotes
        ? formatNumber(profileSelected.delegatedVotes)
        : '-',
    },
    {
      title: 'On-chain votes (90 days)',
      amount: participationRate
        ? `${formatNumberPercentage(participationRate)}`
        : '-',
    },
    {
      title: 'Oracle Score',
      amount: oracleScore ? formatNumber(oracleScore) : '-',
    },
  ];

  return (
    <Flex flexDir="row" flexWrap="wrap" gap="4">
      {rewardStats.map(item => (
        <StatCard key={item.title} title={item.title} amount={item.amount} />
      ))}
    </Flex>
  );
};
