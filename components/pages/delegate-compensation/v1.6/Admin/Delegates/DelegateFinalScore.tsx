/* eslint-disable no-param-reassign */
import {
  Box,
  Code,
  Flex,
  Icon,
  Img,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { DelegateInfoStats } from 'types';
import { formatSimpleNumber } from 'utils';
import { DelegateFeedbackCalculation } from './DelegateFeedbackCalculation';

const statsLabel = {
  participationRate: 'Participation Rate (PR)',
  snapshotVoting: 'Snapshot Voting (SV)',
  onChainVoting: 'On-Chain Voting (TV)',
  bonusPoint: 'Bonus Point (BP)',
  votingPowerMultiplier: 'Voting Power Multiplier (VP)',
  delegateFeedback: 'Delegate Feedback (DF)',
  penaltyPoints: 'Penalty Points (PP)',
};

const statsFormula = (delegateStats: DelegateInfoStats) => ({
  participationRate: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Participation Rate (PR) - Weight 15</Text>
      <Text fontWeight="normal">
        Percentage of the total participation of the member in votes in the last
        90 days. Karma pulls the participation activity directly from onchain
        transactions. This parameter will be calculated at the end of each
        month.
      </Text>
      <Code fontWeight="normal">PR90 formula: (PR90 * 15) / 100</Code>
      <Code fontWeight="normal">
        PR90 = ({delegateStats?.participationRatePercent} * 15) / 100 ={' '}
        {delegateStats?.participationRate}
      </Code>
    </Flex>
  ),
  snapshotVoting: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Snapshot Voting (SV) - Weight 20</Text>
      <Text fontWeight="normal">
        Percentage of delegate participation in snapshot voting. This parameter
        is reset at the beginning of each month.
      </Text>
      <List fontWeight="normal">
        <ListItem>
          <b>Tn</b>: Number of total proposals that were sent to snapshots for
          voting in the month.
        </ListItem>
        <ListItem>
          <b>Rn:</b> Number of proposals the delegate voted on in the month.
        </ListItem>
      </List>
      <Code fontWeight="normal">SV formula: (SV(Rn) / SV(Tn)) * 20</Code>
      <Code fontWeight="normal">
        SV = ({delegateStats?.snapshotVoting.rn} /{' '}
        {delegateStats?.snapshotVoting.tn}) * 20 ={' '}
        {delegateStats?.snapshotVoting?.score}
      </Code>
    </Flex>
  ),
  onChainVoting: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Onchain Voting (TV) - Weight 25</Text>
      <Text fontWeight="normal">
        Percentage of delegate participation in onchain voting. This parameter
        is reset at the beginning of each month.
      </Text>
      <List fontWeight="normal">
        <ListItem>
          <b>Tn</b>: Number of total proposals that were sent onchain for voting
          in the month.
        </ListItem>
        <ListItem>
          <b>Rn:</b> Number of proposals the delegate voted onchain in the
          month.
        </ListItem>
      </List>
      <Code fontWeight="normal">TV formula: (TV(Rn) / TV(Tn)) * 25</Code>
      <Code fontWeight="normal">
        TV = ({delegateStats?.onChainVoting.rn} /{' '}
        {delegateStats?.onChainVoting.tn}) * 25 ={' '}
        {delegateStats?.onChainVoting?.score}
      </Code>
    </Flex>
  ),
  votingPowerAverage: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Average Voting Power</Text>
      <Text fontWeight="normal">
        Average of the voting power of the delegate in the last month.
      </Text>
    </Flex>
  ),
  bonusPoint: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Bonus Point (BP) - Extra +30% TP</Text>
      <Text fontWeight="normal">
        Determined by attendance at monthly calls (Biweekly and GRC) - 5% of
        earned TP and extraordinary contributions. A delegate can only get a
        total of 30 points between both concepts. This parameter is reset at the
        beginning of each month.
      </Text>

      <Code fontWeight="normal">
        BP formula: (Biweekly calls * 0.0125 + Monthly calls * 0.0125) +
        Contributions
      </Code>
      <Code fontWeight="normal">
        BP = ({delegateStats?.biweeklyCalls || 0} * 0.0125 +{' '}
        {delegateStats?.monthlyCalls || 0} * 0.0125) +{' '}
        {delegateStats?.contributions || 0} = {delegateStats?.bonusPoint}
      </Code>
    </Flex>
  ),
  votingPowerMultiplier: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Voting Power Multiplier (VP) - Weight 1</Text>
      <Text fontWeight="normal">
        This multiplier adjusts the Voting Score based on a delegate&apos;s
        Voting Power (VP). Delegates with 50,000 VP receive a multiplier of 0.8
        (minimum), while those with 4,000,000+ VP receive a multiplier of 1.0
        (maximum). The VP used is a daily weighted average throughout the month.
      </Text>
      <Code fontWeight="normal">
        VP multiplier formula: 0.00000005063 * VP + 0.7974685
      </Code>
      <Code fontWeight="normal">
        VP = 0.00000005063 * {delegateStats?.votingPowerAverage} + 0.7974685 ={' '}
        {delegateStats?.votingPowerMultiplier}
      </Code>
    </Flex>
  ),
  delegateFeedback: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Delegates Feedback (DF) - Weight 40</Text>
      <Text fontWeight="normal">
        This is the score given by the program administrator regarding the
        feedback and contributions provided by the delegate during the month.
        The scoring range in the rubric for each comment is 0 to 10. This
        includes the former Communication Rationale parameter and considers all
        forms of participation within the DAO.
      </Text>
      <Code fontWeight="normal">
        DF formula: (Σ qualitative criteria) / 50 * Presence in discussions
        multiplier * 40 (DF weight)
      </Code>
      <Code fontWeight="normal">
        {delegateStats?.delegateFeedback && (
          <DelegateFeedbackCalculation
            delegateFeedback={delegateStats?.delegateFeedback}
          />
        )}
      </Code>
    </Flex>
  ),
  penaltyPoints: (
    <Flex flexDir="column" py="1" gap="2">
      <Text fontWeight={600}>Penalty Points (PP) - Penalty for delayed votes</Text>
      <Text fontWeight="normal">
        Penalty points applied when a delegate delays their vote on Security
        Council proposals, calculated based on the time between proposal creation
        and their vote.
      </Text>
      {delegateStats?.securityPenaltyBreakdown && (
        <>
        <Code fontWeight="normal">
          PP Formula: (MaxPenalty - MinPenalty) / (LastDay - FirstDay) = points per day
        </Code>
        <Code fontWeight="normal">
          PP: {delegateStats.securityPenaltyBreakdown}
        </Code>
        </>
      )}
    </Flex>
  ),
});

export const InfoTooltip = ({
  stat,
  stats,
}: {
  stat:
    | 'participationRate'
    | 'snapshotVoting'
    | 'onChainVoting'
    | 'bonusPoint'
    | 'votingPowerMultiplier'
    | 'votingPowerAverage'
    | 'delegateFeedback'
    | 'penaltyPoints';
  stats: DelegateInfoStats;
}) => {
  const { theme } = useDAO();

  const label = statsFormula(stats)[stat as keyof typeof statsFormula];

  return (
    <Tooltip
      placement="top"
      label={label}
      hasArrow
      bgColor={theme.compensation?.card.bg}
      color={theme.compensation?.card.text}
      fontWeight="normal"
      fontSize="sm"
      borderRadius={10}
      p="3"
      minW={{ base: 'full', md: '380px' }}
    >
      <Text as="span">
        <Icon boxSize="12px" as={BsFillInfoCircleFill} cursor="help" />
      </Text>
    </Tooltip>
  );
};

export const DelegateFinalScoreModal = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}) => {
  const { theme } = useDAO();
  const { delegateInfo } = useDelegateCompensation();
  const delegateStats = delegateInfo?.stats as DelegateInfoStats;

  const {
    participationRate = '0',
    snapshotVoting: { score: snapshotScore = '0' },
    onChainVoting: { score: onChainScore = '0' },
    votingPowerMultiplier = '0',
    delegateFeedback: { finalScore: delegateFeedbackScore = '0' } = {},
    bonusPoint = '0',
    securityCouncilVotePenalty = '0',
  } = delegateStats || {};

  const stats = {
    participationRate,
    snapshotVoting: snapshotScore,
    onChainVoting: onChainScore,
    votingPowerMultiplier,
    delegateFeedback: delegateFeedbackScore,
    bonusPoint,
    penaltyPoints: securityCouncilVotePenalty,
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalOverlay />
      <ModalContent rounded="4px" w="full" maxW="860px">
        <ModalHeader
          bg={theme.compensation?.card.bg}
          textColor={theme.compensation?.card.text}
          rounded="4px"
        >
          <Text
            fontSize="lg"
            textAlign="center"
            fontWeight="bold"
            color={theme.compensation?.card.text}
          >
            Final Score
          </Text>
        </ModalHeader>
        <ModalCloseButton textColor={theme.compensation?.card.text} />
        <ModalBody
          bg={theme.compensation?.card.bg}
          textColor={theme.compensation?.card.text}
          maxH="80vh"
          overflowY="auto"
          rounded="4px"
          px="10"
          py="8"
        >
          <Box bg={theme.card.background} borderRadius="lg" p={4} width="full">
            <VStack spacing={4} align="stretch">
              <Flex
                flexDir="row"
                gap="8"
                align="center"
                justify="center"
                h="100%"
                flex="1"
              >
                <Flex flexDir="column" gap={2} wrap="wrap">
                  {Object.entries(stats).map(([key, value]) => (
                    <Flex
                      flexDir="row"
                      align="center"
                      justify="space-between"
                      key={key}
                      flex="1"
                      minW="150px"
                      gap="8"
                    >
                      <Flex flexDir="row" align="center" gap="2">
                        <Text
                          color={theme.compensation?.card.text}
                          fontWeight="600"
                          fontSize="16px"
                          mb={1}
                        >
                          {statsLabel[key as keyof typeof statsLabel]}
                        </Text>
                        <InfoTooltip
                          stat={key as keyof typeof statsFormula}
                          stats={delegateStats}
                        />
                      </Flex>

                      <Text
                        fontSize="20px"
                        fontWeight={700}
                        color={theme.compensation?.card.secondaryText}
                        lineHeight="32px"
                        minW="60px"
                        minH="32px"
                        bg={theme.compensation?.bg}
                        textAlign="end"
                        px="1"
                      >
                        {formatSimpleNumber(value) || '0'}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                <Flex
                  flexDir="column"
                  gap="3"
                  justify="center"
                  align="center"
                  borderRadius="8px"
                  bg={theme.compensation?.icons.delegateFeedback}
                  maxH="330px"
                  h="full"
                  minH="full"
                  px="32px"
                  py="72px"
                  flex="1"
                >
                  <Img
                    src="/icons/delegate-compensation/delegateFeedback.png"
                    w="40px"
                    h="40px"
                  />
                  <Flex
                    flexDir="column"
                    gap="0"
                    align="center"
                    justify="center"
                  >
                    <Flex flexDir="row" gap="1" align="center" justify="center">
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        color={theme.compensation?.card.text}
                        textAlign="center"
                      >
                        Final Score
                      </Text>
                      <Tooltip
                        placement="top"
                        label={
                          <Flex flexDir="column" py="1" gap="2">
                            <Text fontWeight={600}>
                              Total Participation (TP)
                            </Text>
                            <Text fontWeight="normal">
                              Sum of the results of activities performed by the
                              delegate. A TP% of 100 indicates full
                              participation.
                            </Text>

                            <Code fontWeight="normal">
                              TP% formula: ((PR + SV + TV) * VP Multiplier + DF +
                              BP) - PP
                            </Code>
                          </Flex>
                        }
                        hasArrow
                        bgColor={theme.compensation?.card.bg}
                        color={theme.compensation?.card.text}
                        fontWeight="normal"
                        fontSize="sm"
                        borderRadius={10}
                        p="3"
                      >
                        <Text as="span">
                          <Icon
                            boxSize="12px"
                            as={BsFillInfoCircleFill}
                            cursor="help"
                          />
                        </Text>
                      </Tooltip>
                    </Flex>
                    <Text
                      fontSize="36px"
                      fontWeight={600}
                      color={theme.compensation?.card.secondaryText}
                      w="120px"
                      textAlign="center"
                    >
                      {formatSimpleNumber(
                        delegateStats?.totalParticipation || 0
                      ) || '0'}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
