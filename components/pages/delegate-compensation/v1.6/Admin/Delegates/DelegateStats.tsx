import { Button, Flex, Icon, Img, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { ChakraLink } from 'components/ChakraLink';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import pluralize from 'pluralize';
import { useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { formatNumber, formatSimpleNumber } from 'utils';
import { getPRBreakdown } from 'utils/delegate-compensation/getPRBreakdown';
import { getProposals } from 'utils/delegate-compensation/getProposals';
import { DelegateStatsFromAPI } from 'types';
import { HandlesTooltip } from 'components/HandlesTooltip';
import { MonthNotFinishedTooltip } from '../../../MonthNotFinishedTooltip';
import { DelegateBP } from './DelegateBP';
import { DelegateFeedback } from './DelegateFeedback';
import { DelegateFinalScoreModal, InfoTooltip } from './DelegateFinalScore';
import { DelegatePeriodIndicator } from './DelegatePeriodIndicator';
import { VotingPowerBreakdownModal } from './VotingPowerBreakdownModal';

export const DelegateStats = () => {
  const { delegateInfo, selectedDate } = useDelegateCompensation();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isFinalScoreModalOpen, setIsFinalScoreModalOpen] = useState(false);
  const [isVotingPowerModalOpen, setIsVotingPowerModalOpen] = useState(false);
  const { theme, daoInfo } = useDAO();
  const { isDaoAdmin: isAuthorized } = useAuth();

  const { data: prBreakdown } = useQuery({
    queryKey: [
      'participation-rate-breakdown',
      delegateInfo?.publicAddress,
      daoInfo.config.DAO_KARMA_ID,
    ],
    queryFn: () =>
      getPRBreakdown(
        delegateInfo?.publicAddress,
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month,
        selectedDate?.value.year
      ),
    enabled:
      !!delegateInfo?.publicAddress &&
      !!daoInfo.config.DAO_KARMA_ID &&
      !!selectedDate?.value.year &&
      !!selectedDate?.value.month,
  });

  const { data: proposalsData } = useQuery(
    [
      'delegate-compensation-proposals',
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    () =>
      getProposals(
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month as string | number,
        selectedDate?.value.year as string | number
      ),
    {
      initialData: {
        proposals: [],
        finished: false,
      },
      enabled:
        !!selectedDate?.value.month &&
        !!selectedDate?.value.year &&
        !!daoInfo.config.DAO_KARMA_ID,
      refetchOnWindowFocus: false,
    }
  );

  const isMonthFinished = proposalsData?.finished || false;

  const isPenaltyMonth =
    (selectedDate?.value.month &&
      selectedDate?.value.month >= 4 &&
      selectedDate?.value.year === 2025) ||
    (selectedDate?.value.year && selectedDate?.value.year > 2025);

  return (
    <Flex flexDir="column" w="full" gap="5">
      {/* Delegate Feedback Modal */}
      {isFeedbackModalOpen ? (
        <DelegateFeedback
          isModalOpen={isFeedbackModalOpen}
          setIsModalOpen={setIsFeedbackModalOpen}
        />
      ) : null}
      {/* Delegate Feedback Modal */}
      {isFinalScoreModalOpen ? (
        <DelegateFinalScoreModal
          isModalOpen={isFinalScoreModalOpen}
          setIsModalOpen={setIsFinalScoreModalOpen}
        />
      ) : null}
      {/* New Voting Power Breakdown Modal */}
      <VotingPowerBreakdownModal
        isOpen={isVotingPowerModalOpen}
        onClose={() => setIsVotingPowerModalOpen(false)}
        votingPowerBreakdown={delegateInfo?.stats?.votingPowerBreakdown || []}
        votingPowerAverage={
          Number(delegateInfo?.stats?.votingPowerAverage) || 0
        }
      />
      {/* 3 blocks */}
      <Flex
        flexDir={['column', 'column', 'row']}
        flexWrap="wrap"
        w="full"
        gap="5"
      >
        <DelegatePeriodIndicator />
        <Flex
          flexDir="column"
          bg={theme.compensation?.card.bg}
          flex="1"
          borderRadius="8px"
        >
          <Flex
            flexDir="row"
            gap="4"
            alignItems="center"
            justifyContent="space-between"
            w="full"
            p="3"
            borderBottom="1px solid"
            borderBottomColor={theme.compensation?.card.divider}
          >
            <Flex flexDir="row" w="full" gap="3" align="center">
              <Flex
                borderRadius="4px"
                bg={theme.compensation?.icons.snapshot}
                w="40px"
                h="40px"
              >
                <Img
                  src="/icons/delegate-compensation/snapshot.jpg"
                  w="40px"
                  h="40px"
                  mixBlendMode="multiply"
                  borderRadius="4px"
                />
              </Flex>
              <Text
                fontSize="16px"
                fontWeight="600"
                color={theme.compensation?.card.text}
              >
                Snapshot Stats
              </Text>
            </Flex>

            <ChakraLink
              href={`https://snapshot.org/#/profile/${delegateInfo?.publicAddress}`}
              isExternal
              _hover={{ opacity: 0.8 }}
            >
              <Icon
                as={FaExternalLinkAlt}
                w="20px"
                h="20px"
                color={theme.compensation?.card.secondaryText}
              />
            </ChakraLink>
          </Flex>
          <Flex flexDir="column" p="4" justify="center" align="flex-start">
            <Text
              fontSize="16px"
              fontWeight={400}
              color={theme.compensation?.card.secondaryText}
            >
              Score
            </Text>
            <Flex flexDir="row" gap="2" align="center">
              <Text
                fontSize="24px"
                fontWeight={700}
                color={theme.compensation?.card.secondaryText}
              >
                {formatSimpleNumber(
                  delegateInfo?.stats?.snapshotVoting.score || 0
                )}
              </Text>
              <InfoTooltip
                stat="snapshotVoting"
                stats={delegateInfo?.stats as DelegateStatsFromAPI['stats']}
              />
            </Flex>
            <Flex flexDir="row" gap="2">
              <Text
                fontSize="14px"
                fontWeight={400}
                color={theme.compensation?.card.secondaryText}
                as="span"
              >
                {delegateInfo?.stats?.snapshotVoting.tn} Total{' '}
                {pluralize(
                  'Proposals',
                  +(delegateInfo?.stats?.snapshotVoting.tn || 0)
                )}
                ,
              </Text>
              <Text
                fontSize="14px"
                fontWeight={400}
                color={theme.compensation?.card.success}
                as="span"
              >
                {delegateInfo?.stats?.snapshotVoting.rn} Voted On
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          flexDir="column"
          bg={theme.compensation?.card.bg}
          flex="1"
          borderRadius="8px"
        >
          <Flex
            flexDir="row"
            gap="4"
            alignItems="center"
            justifyContent="space-between"
            w="full"
            p="3"
            borderBottom="1px solid"
            borderBottomColor={theme.compensation?.card.divider}
          >
            <Flex flexDir="row" w="full" gap="3" align="center">
              <Flex
                borderRadius="4px"
                bg={theme.compensation?.icons.onchain}
                w="40px"
                h="40px"
                justify="center"
                align="center"
              >
                <Img
                  src="/icons/delegate-compensation/onchain.png"
                  w="24px"
                  h="24px"
                />
              </Flex>
              <Text
                fontSize="16px"
                fontWeight="600"
                color={theme.compensation?.card.text}
              >
                Onchain Stats
              </Text>
            </Flex>
            <ChakraLink
              href={`https://www.tally.xyz/gov/${daoInfo.config.DAO_KARMA_ID}/delegate/${delegateInfo?.publicAddress}`}
              isExternal
              _hover={{ opacity: 0.8 }}
            >
              <Icon
                as={FaExternalLinkAlt}
                w="20px"
                h="20px"
                color={theme.compensation?.card.secondaryText}
              />
            </ChakraLink>
          </Flex>
          <Flex flexDir="column" p="4" justify="center" align="flex-start">
            <Text
              fontSize="16px"
              fontWeight={400}
              color={theme.compensation?.card.secondaryText}
            >
              Score
            </Text>
            <Flex flexDir="row" gap="2" align="center">
              <Text
                fontSize="24px"
                fontWeight={700}
                color={theme.compensation?.card.secondaryText}
              >
                {formatSimpleNumber(
                  delegateInfo?.stats?.onChainVoting.score || 0
                )}
              </Text>
              <InfoTooltip
                stat="onChainVoting"
                stats={delegateInfo?.stats as DelegateStatsFromAPI['stats']}
              />
            </Flex>

            <Flex flexDir="row" gap="2">
              <Text
                fontSize="14px"
                fontWeight={400}
                color={theme.compensation?.card.secondaryText}
                as="span"
              >
                {delegateInfo?.stats?.onChainVoting.tn} Total{' '}
                {pluralize(
                  'Proposals',
                  +(delegateInfo?.stats?.onChainVoting.tn || 0)
                )}
                ,
              </Text>
              <Text
                fontSize="14px"
                fontWeight={400}
                color={theme.compensation?.card.success}
                as="span"
              >
                {delegateInfo?.stats?.onChainVoting.rn} Voted On
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex
          flexDir="column"
          bg={theme.compensation?.icons.finalScore}
          flex="1"
          borderRadius="8px"
          align="center"
          justify="center"
          py="4"
          display={['none', 'flex']}
        >
          <Img
            src="/icons/delegate-compensation/finalScore.png"
            w="40px"
            h="40px"
            borderRadius="4px"
          />

          <Text
            fontSize="16px"
            fontWeight="600"
            color={theme.compensation?.card.text}
          >
            Final Score
          </Text>
          {isMonthFinished || isAuthorized ? (
            <Text
              fontSize="36px"
              fontWeight={600}
              color={theme.compensation?.card.success}
              textDecoration="underline"
              onClick={() => setIsFinalScoreModalOpen(true)}
              cursor="pointer"
            >
              {formatSimpleNumber(delegateInfo?.stats?.totalParticipation || 0)}
            </Text>
          ) : (
            <MonthNotFinishedTooltip />
          )}
        </Flex>
      </Flex>
      {/* 4 blocks */}

      <Flex
        flexDir={['column', 'column', 'row']}
        flexWrap="wrap"
        w="full"
        gap="5"
        flex="1"
      >
        <Flex
          flexDir="row"
          bg={theme.compensation?.card.bg}
          flex="1"
          borderRadius="8px"
          p="3"
          gap="3"
          justify="flex-start"
          align="flex-start"
        >
          <Flex
            borderRadius="4px"
            bg={theme.compensation?.icons.delegateFeedback}
            w="40px"
            h="40px"
            minW="40px"
            minH="40px"
            maxW="40px"
            maxH="40px"
            justify="center"
            align="center"
          >
            <Img
              src="/icons/delegate-compensation/delegateFeedback.png"
              w="24px"
              h="24px"
            />
          </Flex>
          <Flex
            flexDir="column"
            gap="2"
            justify="center"
            align="flex-start"
            minW="120px"
            w="full"
          >
            <Flex
              flexDir="row"
              w="full"
              gap="2"
              align="center"
              justify="space-between"
            >
              <Button
                p="0"
                bg="transparent"
                borderRadius="0"
                h="24px"
                _hover={{ opacity: 0.8 }}
                _focus={{ opacity: 0.8 }}
                _focusVisible={{ opacity: 0.8 }}
                _focusWithin={{ opacity: 0.8 }}
                fontSize="16px"
                fontWeight="600"
                color={theme.compensation?.card.text}
                borderBottom="1px solid"
                borderBottomColor={theme.compensation?.card.text}
                onClick={() => setIsFeedbackModalOpen(true)}
              >
                Delegate Feedback
              </Button>

              {delegateInfo?.discourseHandles ? (
                <HandlesTooltip handles={delegateInfo?.discourseHandles} />
              ) : null}
            </Flex>
            {isMonthFinished || isAuthorized ? (
              <Flex flexDir="row" gap="2" align="center">
                <Text
                  fontSize="24px"
                  fontWeight={700}
                  color={theme.compensation?.card.secondaryText}
                  lineHeight="32px"
                >
                  {formatSimpleNumber(
                    delegateInfo?.stats?.delegateFeedback?.finalScore || 0
                  )}
                </Text>

                <InfoTooltip
                  stat="delegateFeedback"
                  stats={delegateInfo?.stats as DelegateStatsFromAPI['stats']}
                />
              </Flex>
            ) : (
              <MonthNotFinishedTooltip />
            )}
          </Flex>
        </Flex>

        <Flex
          flexDir="row"
          bg={theme.compensation?.card.bg}
          flex="1"
          borderRadius="8px"
          p="3"
          gap="3"
          justify="flex-start"
          align="flex-start"
        >
          <Flex
            borderRadius="4px"
            bg={theme.compensation?.icons.bonusPoint}
            w="40px"
            h="40px"
            minW="40px"
            minH="40px"
            maxW="40px"
            maxH="40px"
            justify="center"
            align="center"
          >
            <Img
              src="/icons/delegate-compensation/bonusPoint.png"
              w="24px"
              h="24px"
            />
          </Flex>

          <DelegateBP isMonthFinished={isMonthFinished} />
        </Flex>

        {/* Penalty Points Card */}
        {isPenaltyMonth && delegateInfo?.stats?.securityPenaltyBreakdown ? (
          <Flex
            flexDir="row"
            bg={theme.compensation?.card.bg}
            flex="1"
            borderRadius="8px"
            p="3"
            gap="3"
            justify="flex-start"
            align="flex-start"
          >
            <Flex
              borderRadius="4px"
              bg={
                delegateInfo?.stats?.securityPenaltyBreakdown
                  ? theme.compensation?.icons?.penaltyYes
                  : theme.compensation?.icons?.penaltyNo
              }
              w="40px"
              h="40px"
              minW="40px"
              minH="40px"
              maxW="40px"
              maxH="40px"
              justify="center"
              align="center"
            >
              <Img
                src="/icons/delegate-compensation/voted.svg"
                w="24px"
                h="24px"
              />
            </Flex>
            {delegateInfo?.stats?.securityPenaltyBreakdown ? (
              <Flex
                flexDir="column"
                gap="0"
                justify="center"
                align="flex-start"
              >
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color={theme.compensation?.card.text}
                >
                  Voted on SC Elections
                </Text>
                <Flex flexDir="row" gap="2" align="center">
                  <Text
                    fontSize="14px"
                    fontWeight={600}
                    color={theme.compensation?.card.text}
                  >
                    Penalty Points
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight={700}
                    color={theme.compensation?.card.secondaryText}
                  >
                    {formatSimpleNumber(
                      delegateInfo?.stats?.securityCouncilVotePenalty || 0
                    )}
                  </Text>
                  <InfoTooltip
                    stat="penaltyPoints"
                    stats={delegateInfo?.stats as DelegateStatsFromAPI['stats']}
                  />
                </Flex>
              </Flex>
            ) : (
              <Flex
                flexDir="column"
                gap="0"
                justify="center"
                align="flex-start"
              >
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color={theme.compensation?.card.text}
                >
                  {`Didn't vote on SC Elections`}
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight={400}
                  color={theme.compensation?.card.secondaryText}
                  mt="2"
                >
                  Disqualified of {selectedDate?.name} Incentives
                </Text>
              </Flex>
            )}
          </Flex>
        ) : null}

        <Flex
          flexDir="row"
          bg={theme.compensation?.card.bg}
          flex="1"
          borderRadius="8px"
          p="3"
          gap="3"
          justify="flex-start"
          align="flex-start"
        >
          <Flex
            borderRadius="4px"
            bg={theme.compensation?.icons.participationRate}
            w="40px"
            h="40px"
            minW="40px"
            minH="40px"
            maxW="40px"
            maxH="40px"
            justify="center"
            align="center"
          >
            <Img
              src="/icons/delegate-compensation/flexArm.png"
              w="24px"
              h="24px"
            />
          </Flex>
          <Flex flexDir="column" gap="0" justify="center" align="flex-start">
            <Text
              fontSize="16px"
              fontWeight="600"
              color={theme.compensation?.card.text}
            >
              Average Voting Power
            </Text>
            <Flex
              flexDir="column"
              gap="0"
              justify="center"
              align="flex-start"
              onClick={() => setIsVotingPowerModalOpen(true)}
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
            >
              <Flex flexDir="row" gap="2" align="center">
                <Text
                  fontSize="24px"
                  fontWeight={700}
                  color={theme.compensation?.card.secondaryText}
                  textDecoration="underline"
                >
                  {formatNumber(delegateInfo?.stats?.votingPowerAverage || 0)}
                </Text>

                <InfoTooltip
                  stat="votingPowerAverage"
                  stats={delegateInfo?.stats as DelegateStatsFromAPI['stats']}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          flexDir="row"
          bg={theme.compensation?.card.bg}
          flex="1"
          borderRadius="8px"
          p="3"
          gap="3"
          justify="flex-start"
          align="flex-start"
        >
          <Flex
            borderRadius="4px"
            bg={theme.compensation?.icons.participationRate}
            w="40px"
            h="40px"
            minW="40px"
            minH="40px"
            maxW="40px"
            maxH="40px"
            justify="center"
            align="center"
          >
            <Img
              src="/icons/delegate-compensation/participationRate.png"
              w="24px"
              h="24px"
            />
          </Flex>
          <Flex flexDir="column" gap="0" justify="center" align="flex-start">
            <Text
              fontSize="16px"
              fontWeight="600"
              color={theme.compensation?.card.text}
            >
              Participation Rate
            </Text>
            <Flex flexDir="column" gap="0" justify="center" align="flex-start">
              <Flex flexDir="row" gap="2" align="center">
                <Text
                  fontSize="24px"
                  fontWeight={700}
                  color={theme.compensation?.card.secondaryText}
                >
                  {formatSimpleNumber(
                    delegateInfo?.stats?.participationRate || 0
                  )}
                </Text>

                <InfoTooltip
                  stat="participationRate"
                  stats={delegateInfo?.stats as DelegateStatsFromAPI['stats']}
                />
              </Flex>
              <Flex flexDir="row" gap="2">
                <Text
                  fontSize="14px"
                  fontWeight={400}
                  color={theme.compensation?.card.secondaryText}
                  as="span"
                >
                  {prBreakdown?.proposals.length} Total{' '}
                  {pluralize(
                    'Proposals',
                    +(prBreakdown?.proposals.length || 0)
                  )}
                  ,{' '}
                  <Text
                    fontSize="14px"
                    fontWeight={400}
                    color={theme.compensation?.card.success}
                    as="span"
                  >
                    {prBreakdown?.votes.length} Voted On
                  </Text>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        flexDir="column"
        bg={theme.compensation?.icons.finalScore}
        flex="1"
        borderRadius="8px"
        align="center"
        justify="center"
        py="4"
        display={['flex', 'none']}
      >
        <Img
          src="/icons/delegate-compensation/finalScore.png"
          w="40px"
          h="40px"
          borderRadius="4px"
        />

        <Text
          fontSize="16px"
          fontWeight="600"
          color={theme.compensation?.card.text}
        >
          Final Score
        </Text>

        {isMonthFinished || isAuthorized ? (
          <Text
            fontSize="36px"
            fontWeight={600}
            color={theme.compensation?.card.success}
            textDecoration="underline"
            onClick={() => setIsFinalScoreModalOpen(true)}
            cursor="pointer"
          >
            {formatSimpleNumber(delegateInfo?.stats?.totalParticipation || 0)}
          </Text>
        ) : (
          <MonthNotFinishedTooltip />
        )}
      </Flex>
    </Flex>
  );
};
