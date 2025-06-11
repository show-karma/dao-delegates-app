import { Flex, Text, Spinner } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC } from 'react';
import { IDelegate } from 'types';
import { useOracleBreakdown } from 'hooks/useOracleBreakdown';
import { VotingProposalsCard } from './VotingProposalsCard';
import { RewardStatsRow } from './RewardStatsRow';

interface IRewardDetailsProps {
  profile: IDelegate;
}

export const RewardDetails: FC<IRewardDetailsProps> = ({ profile }) => {
  const { theme } = useDAO();
  const {
    data: oracleData,
    isLoading,
    error,
  } = useOracleBreakdown(profile.address);

  if (isLoading) {
    return (
      <Flex
        flexDir="column"
        w="full"
        px={{ base: '4', lg: '6' }}
        py="6"
        gap="6"
        align="center"
        justify="center"
        minH="400px"
      >
        <Spinner size="lg" color={theme.text} />
        <Text color={theme.subtitle}>Loading reward details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        flexDir="column"
        w="full"
        px={{ base: '4', lg: '6' }}
        py="6"
        gap="6"
      >
        <Text color={theme.title} fontSize="2xl" fontWeight="bold">
          Reward Details
        </Text>

        <Flex
          flexDir="column"
          gap="2"
          p="6"
          borderRadius="md"
          bg={theme.card.background}
          borderWidth="1px"
          borderColor={theme.card.border}
          align="center"
        >
          <Text color={theme.subtitle} fontSize="md">
            Failed to load reward details data
          </Text>
          <Text color={theme.subtitle} fontSize="sm">
            Please try again later
          </Text>
        </Flex>
      </Flex>
    );
  }

  const breakdown = oracleData?.data;
  const hasOnChainProposals = breakdown?.onChainData?.participation?.length
    ? breakdown.onChainData.participation.length > 0
    : false;
  const hasOffChainProposals = breakdown?.offChainData?.participation?.length
    ? breakdown.offChainData.participation.length > 0
    : false;

  return (
    <Flex flexDir="column" w="full" px={{ base: '4', lg: '6' }} py="6" gap="6">
      {/* Reward Stats Cards */}
      <RewardStatsRow
        participationRate={(breakdown?.onChainData?.votedPct || 0) * 100}
        oracleScore={breakdown?.formulaBreakdown?.finalScore}
      />

      {/* OnChain Proposals Table - only show if there are proposals */}
      {hasOnChainProposals && breakdown?.onChainData && (
        <VotingProposalsCard
          proposals={breakdown.onChainData.participation}
          totalProposals={breakdown.onChainData.proposals}
          votedOnCount={breakdown.onChainData.votes}
          votedPct={breakdown.onChainData.votedPct}
          type="onChain"
        />
      )}

      {/* OffChain/Snapshot Proposals Table - only show if there are proposals */}
      {hasOffChainProposals && breakdown?.offChainData && (
        <VotingProposalsCard
          proposals={breakdown.offChainData.participation}
          totalProposals={breakdown.offChainData.proposals}
          votedOnCount={breakdown.offChainData.votes}
          votedPct={breakdown.offChainData.votedPct}
          type="offChain"
        />
      )}

      {/* Show message if no proposals data */}
      {!hasOnChainProposals && !hasOffChainProposals && (
        <Flex
          flexDir="column"
          gap="2"
          p="6"
          borderRadius="md"
          bg={theme.card.background}
          borderWidth="1px"
          borderColor={theme.card.border}
          align="center"
        >
          <Text color={theme.subtitle} fontSize="md">
            No proposal participation data available
          </Text>
        </Flex>
      )}

      {/* Formula Information */}
      {breakdown?.formula && (
        <Flex
          flexDir="column"
          gap="2"
          p="4"
          borderRadius="md"
          bg={theme.card.background}
          borderWidth="1px"
          borderColor={theme.card.border}
        >
          <Text color={theme.title} fontSize="sm" fontWeight="600">
            Score Calculation
          </Text>
          <Text color={theme.subtitle} fontSize="xs">
            Formula: {breakdown.formula}
          </Text>
          {breakdown.formulaBreakdown?.calculation && (
            <Text color={theme.subtitle} fontSize="xs">
              Calculation: {breakdown.formulaBreakdown.calculation}
            </Text>
          )}
        </Flex>
      )}
    </Flex>
  );
};
