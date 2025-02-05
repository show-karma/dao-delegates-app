/* eslint-disable no-nested-ternary */
import {
  Button,
  Divider,
  Flex,
  Icon,
  Link,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import {
  AbstainIcon,
  AgainstIcon,
  DidNotVoteIcon,
  EmptyCircleIcon,
  ForIcon,
} from 'components/Icons';
import { useDAO, useDelegates } from 'contexts';
import { useVoteReason } from 'hooks';
import { FC, useMemo } from 'react';
import { IChainRow, IDelegate } from 'types';
import { formatDate } from 'utils';
import { SelectedProposal } from 'types/voting-reason';
import { ExpandableReason } from './ExpandableReason';
import { ExpandableTitle } from './ExpandableTitle';

const iconStyle = {
  width: '1rem',
  height: '1rem',
};

const CheckDecision = (choice: string) => {
  if (choice === 'Not voted yet') {
    return <Icon as={DidNotVoteIcon} color="#f1c40f" {...iconStyle} />;
  }
  if (/not vote/gi.test(choice)) {
    return <Icon as={DidNotVoteIcon} color="#FFF7AE" {...iconStyle} />;
  }
  // eslint-disable-next-line react/destructuring-assignment
  const choiceLowerCase = choice.toLocaleLowerCase();
  if (
    choiceLowerCase.substring(0, 2) === 'no' ||
    /agai+nst/gi.test(choice) ||
    choiceLowerCase.substring(0, 3) === 'nay' ||
    choiceLowerCase.substring(0, 3) === 'nae'
  ) {
    return <Icon as={AgainstIcon} color="#CA4444" {...iconStyle} />;
  }
  if (/abstain/gi.test(choice))
    return <Icon as={AbstainIcon} color="#DFDFDF" {...iconStyle} />;

  return <Icon as={ForIcon} color="#02E2AC" {...iconStyle} />;
};

const VoteIcon: FC<{ vote: IChainRow }> = ({ vote }) => {
  if (typeof vote === 'undefined')
    return <Icon as={DidNotVoteIcon} color="#FFF7AE" {...iconStyle} />;
  if (vote.voteMethod !== 'On-chain' && typeof vote.choice === 'string')
    return CheckDecision(vote.choice);
  if (vote.solution)
    return <Icon as={ForIcon} color="#02E2AC" {...iconStyle} />;
  switch (vote.choice) {
    case 0:
      return <Icon as={AgainstIcon} color="#CA4444" {...iconStyle} />;
    case 1:
      return <Icon as={ForIcon} color="#02E2AC" {...iconStyle} />;
    case 'Did not vote':
      return <Icon as={DidNotVoteIcon} color="#FFF7AE" {...iconStyle} />;
    case 'Not voted yet':
      return <Icon as={DidNotVoteIcon} color="#f1c40f" {...iconStyle} />;
    case 2:
      return <Icon as={EmptyCircleIcon} color="gray.300" {...iconStyle} />;
    case 'ABSTAIN':
      return <Icon as={EmptyCircleIcon} color="gray.300" {...iconStyle} />;
    default:
      return <Icon as={DidNotVoteIcon} color="#FFF7AE" {...iconStyle} />;
  }
};

interface IProposalVote {
  vote: IChainRow;
  isLoading?: boolean;
  profile: IDelegate;
  isLast?: boolean;
  index: number;
  onSelectProposal?: (proposal: SelectedProposal) => void;
}

export const ProposalVote: FC<IProposalVote> = ({
  vote,
  isLoading,
  profile,
  isLast,
  index,
  onSelectProposal,
}) => {
  const { theme, daoInfo } = useDAO();
  const { tracks } = useDelegates();
  const {
    getVoteReason,
    isVoteOwner,
    data: reasons,
  } = useVoteReason({
    address: profile.address,
  });

  const showChoice = () => {
    if (vote && typeof vote.choice === 'string') return vote.choice;
    if (vote.choice === 0) return 'Against';
    if (vote.choice === 1) return 'For';
    if (vote.choice === 2) return 'Abstain';
    if (vote.choice === 'ABSTAIN') return 'Abstain';
    if (vote.choice === -1 && !vote.finished) return 'Not voted yet';

    return 'Did not vote';
  };

  const canAddReason = useMemo(() => {
    if (vote && isVoteOwner) {
      return ![-1, 'Did not vote', 'Not voted yet'].includes(vote.choice);
    }
    return false;
  }, [vote]);

  const isLoaded = !isLoading && !!vote;

  const voteReason = useMemo(
    () => vote.voteId && getVoteReason(vote.voteId),
    [reasons]
  );

  const isPair = (index + 1) % 2 === 0;

  const foundTrack = tracks.find(
    track => track.id === vote?.trackId
  )?.displayName;

  const dateText = () => {
    if (+vote.executedTimestamp >= Date.now() / 1000) {
      return `Ending on ${vote && formatDate(vote.executed, 'MMMM D, YYYY')}`;
    }
    return `Executed on ${vote && formatDate(vote.executed, 'MMMM D, YYYY')}`;
  };

  return (
    <Flex
      flexDir="column"
      w="full"
      bg={isPair ? `${theme.modal.background}40` : `${theme.modal.background}`}
      pt="5"
      pb={isLast ? '4' : '0'}
    >
      <Flex flexDir="row" w="full" align="center" px="4" gap="2">
        <Flex flexDir="column" w="full">
          {daoInfo.config.DAO_CATEGORIES_TYPE === 'tracks' && foundTrack ? (
            isLoaded ? (
              <Flex
                gap="1"
                flexDir="row"
                borderBottomWidth="1px"
                borderBottomColor={theme.modal.votingHistory.proposal.result}
                pb="1"
                mb="1"
                flex="1"
              >
                {daoInfo.config.TRACKS_DICTIONARY &&
                foundTrack &&
                daoInfo.config.TRACKS_DICTIONARY[foundTrack] ? (
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    color={theme.modal.votingHistory.proposal.result}
                  >
                    {daoInfo.config.TRACKS_DICTIONARY[foundTrack].emoji}
                  </Text>
                ) : null}
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  color={theme.modal.votingHistory.proposal.result}
                >
                  {foundTrack || null}
                </Text>
              </Flex>
            ) : (
              <Skeleton isLoaded={isLoaded} w="32" h="6" />
            )
          ) : null}
          {isLoaded ? (
            <ExpandableTitle text={vote.proposal} />
          ) : (
            <Skeleton isLoaded={isLoaded} w="300px" maxW="372" h="6" />
          )}

          <Flex gap="3" pt="6" align="center">
            {isLoaded ? (
              <Text
                fontSize="xs"
                fontWeight="medium"
                color={theme.modal.votingHistory.proposal.type}
              >
                {vote.voteMethod}
              </Text>
            ) : (
              <Skeleton isLoaded={isLoaded} w="full" maxW="240" h="4" />
            )}
            <Divider
              orientation="vertical"
              bgColor={theme.modal.votingHistory.proposal.verticalDivider}
              w="1px"
              h="4"
            />
            {isLoaded ? (
              <Text
                fontSize="xs"
                fontWeight="medium"
                color={theme.modal.votingHistory.proposal.type}
              >
                {dateText()}
              </Text>
            ) : (
              <Skeleton isLoaded={isLoaded} w="full" maxW="160" h="4" />
            )}

            {((daoInfo.config.PROPOSAL_LINK?.onChain &&
              vote.voteMethod === 'On-chain') ||
              (daoInfo.config.PROPOSAL_LINK?.offChain &&
                vote.voteMethod === 'Off-chain')) &&
            vote?.voteId &&
            vote.version ? (
              <>
                <Divider
                  orientation="vertical"
                  bgColor={theme.modal.votingHistory.proposal.verticalDivider}
                  w="1px"
                  h="4"
                />
                <Link
                  href={daoInfo.config.PROPOSAL_LINK[
                    vote.voteMethod === 'On-chain' ? 'onChain' : 'offChain'
                  ]?.(vote.voteId, vote.version)}
                  isExternal
                  color="blue.400"
                  fontSize="sm"
                  borderBottomColor="blue.400"
                  borderBottomWidth="1px"
                  borderBottomStyle="solid"
                  _hover={{
                    borderBottomColor: 'blue.300',
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                  }}
                >
                  See proposal
                </Link>
              </>
            ) : null}
          </Flex>
        </Flex>
        <Flex
          h="max-content"
          maxW={{ base: 'fit-content', sm: '25%' }}
          w={{ base: 'fit-content', sm: 'full' }}
          align="center"
          justify="center"
          gap="2"
          flexDir="column"
        >
          {isLoaded && vote ? (
            <VoteIcon vote={vote} />
          ) : (
            <SkeletonCircle {...iconStyle} />
          )}
          {isLoaded ? (
            <>
              <Text
                w="fit-content"
                h="max-content"
                fontWeight="bold"
                fontSize="sm"
                color={theme.modal.votingHistory.proposal.result}
                maxH="70px"
                overflow="hidden"
                textAlign="center"
              >
                {showChoice()}
              </Text>
              {canAddReason && (
                <Button
                  variant="link"
                  color="blue.400"
                  fontSize="sm"
                  fontWeight="light"
                  w="fit-content"
                  type="button"
                  onClick={() =>
                    onSelectProposal?.({
                      proposalId: vote.voteId || '',
                      source:
                        vote.voteMethod === 'on-chain' ? 'onchain' : 'offchain',
                      proposalTitle: vote.proposal,
                    })
                  }
                >
                  {voteReason ? 'Update' : 'Add'} reason
                </Button>
              )}
            </>
          ) : (
            <Skeleton w="32" h="4" />
          )}
        </Flex>
      </Flex>

      {!isLast && (
        <Divider
          bgColor={`${theme.modal.votingHistory.reason.divider}0D`}
          mt="4"
          h="1px"
        />
      )}

      {voteReason && (
        <Flex flexDir="column" mt="1" p={4}>
          <ExpandableReason text={voteReason} />

          <Divider
            bgColor={theme.modal.votingHistory.reason.divider}
            mt="4"
            h="1px"
          />
        </Flex>
      )}
    </Flex>
  );
};
