import { Divider, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useDAO, useVotes, useWallet } from 'contexts';
import { FC, useMemo, useState } from 'react';

import { VotingReasonModal } from 'components/VotingReason/VotingReasonModal';
import { useToasty, useVoteReason } from 'hooks';
import { IChainRow, IDelegate } from 'types';
import { SelectedProposal } from 'types/voting-reason';
import { formatNumber } from 'utils';
import { walletClientToSigner } from 'utils/eas/useSigner';
import { VotingReasonPayload } from 'utils/voting-reason/save-voting-reason';
import { optimism, optimismGoerli } from 'viem/chains';
import { useAccount, useSwitchNetwork } from 'wagmi';
import { ContrarionIndexComponent } from './ContrarionIndex';
import { DelegatedVotesChanges } from './DelegatedVotesChanges';
import { Navigation } from './Navigation';
import { OffChainVotingBreakdown } from './OffChainVotingBreakdown';
import { OnChainVotingBreakdown } from './OnChainVotingBreakdown';
import { ProposalVote } from './ProposalVote';
import { SearchProposalInput } from './SearchProposalInput';

interface IVotingHistory {
  profile: IDelegate;
}

export const VotingHistory: FC<IVotingHistory> = ({ profile }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReason, setIsSavingReason] = useState(false);

  const { theme, daoInfo } = useDAO();
  const { isLoading: voteLoading, showingVotes, allVotes } = useVotes();

  const loadArray = Array.from({ length: 6 });
  const { isOpen: votingReasonModalOpen, onToggle: toggleModal } =
    useDisclosure();
  const { address, chain } = useWallet();

  const { switchNetworkAsync } = useSwitchNetwork();

  const { toast } = useToasty();

  const { setVotingReason, isVoteOwner } = useVoteReason({
    address: profile.address,
  });

  const { connector } = useAccount();

  const [selectedProposal, setSelectedProposal] = useState<SelectedProposal>({
    proposalId: '',
    proposalTitle: '',
    source: 'onchain',
  });

  const handleOnSelectProposal = async (proposal: SelectedProposal) => {
    const schemaChainId = +(
      process.env.NEXT_PUBLIC_VOTING_REASON_CHAIN_ID || 420
    );

    if (chain?.id !== schemaChainId) {
      await switchNetworkAsync?.(schemaChainId);
    }

    setSelectedProposal(proposal);

    if (!votingReasonModalOpen) toggleModal();
  };

  const handleSubmitVotingReason = async (payload: VotingReasonPayload) => {
    try {
      const chainId = process.env.NEXT_PUBLIC_VOTING_REASON_CHAIN_ID || 420;

      const client = await connector?.getWalletClient();
      if (!client) throw new Error('Wallet client not found');

      (client.chain as any) = [optimism, optimismGoerli].find(
        ch => ch.id === +chainId
      );

      const signer = walletClientToSigner(client);
      if (!signer) throw new Error('Signer not found');

      setIsSavingReason(true);
      await setVotingReason(payload, daoInfo.config.DAO_KARMA_ID, signer);
      toggleModal();
      toast({
        status: 'success',
        title: 'Success',
        description: 'Voting reason saved successfully',
      });
    } catch (error: any) {
      toast({
        status: 'error',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsSavingReason(false);
    }
  };

  useMemo(() => {
    setIsLoading(voteLoading);
  }, [voteLoading]);

  const loadRows = () =>
    loadArray.map((_, index) => (
      <ProposalVote
        vote={{} as IChainRow}
        key={+index}
        profile={profile}
        isLoading
        index={+index}
        isLast={index === showingVotes.length - 1}
      />
    ));

  const renderVotes = () => {
    if (!showingVotes.length)
      return (
        <Text color={theme.modal.votingHistory.proposal.title}>
          {`Contributor hasn't voted on any proposals yet`}
        </Text>
      );
    return showingVotes.map((vote, index) => (
      <ProposalVote
        key={+index}
        vote={vote}
        isLoading={false}
        profile={profile}
        index={+index}
        isLast={index === showingVotes.length - 1}
        onSelectProposal={handleOnSelectProposal}
      />
    ));
  };

  return (
    <>
      <Flex
        flexDir={{ base: 'column', lg: 'row' }}
        justify="space-between"
        pb="10"
        gap="4"
        align={{ base: 'center', lg: 'flex-start' }}
      >
        <Flex w="full" flexDir="column">
          <Flex
            zIndex="1001"
            boxShadow={`0px 0px 18px 5px ${theme.modal.votingHistory.headline}0D`}
            flexDir="column"
          >
            <Flex
              justify="flex-start"
              gap={['2']}
              align="center"
              flexWrap="wrap"
              py="4"
              bg={`${theme.modal.background}40`}
              px="4"
            >
              <SearchProposalInput />
              <Text
                textColor={`${theme.modal.votingHistory.headline}80`}
                fontWeight="medium"
                fontSize="sm"
              >
                {`Total proposals: ${formatNumber(allVotes.length)}`}
              </Text>
            </Flex>
            <Divider bgColor={`${theme.modal.votingHistory.divider}40`} />
            <Flex
              gap="0.5"
              flexDir="column"
              bg={`${theme.modal.votingHistory.proposal.bg}40`}
            >
              {isLoading ? loadRows() : renderVotes()}
            </Flex>
          </Flex>
          <Flex w="full" justify="center" py="4">
            <Navigation />
          </Flex>
        </Flex>
        <Flex
          flexDir="column"
          align="center"
          gap="5"
          maxW={{ base: '330px', sm: '400px' }}
          w="full"
        >
          {daoInfo.config.EXCLUDED_VOTING_HISTORY_COLUMN.includes(
            'onChainVoteBreakdown'
          ) ? undefined : (
            <OnChainVotingBreakdown />
          )}
          {daoInfo.config.EXCLUDED_VOTING_HISTORY_COLUMN.includes(
            'offChainVoteBreakdown'
          ) ? undefined : (
            <OffChainVotingBreakdown />
          )}
          {daoInfo.config.EXCLUDED_VOTING_HISTORY_COLUMN.includes(
            'votingPowerTimeline'
          ) ? undefined : (
            <DelegatedVotesChanges />
          )}
          {daoInfo.config.EXCLUDED_VOTING_HISTORY_COLUMN.includes(
            'contrarionIndex'
          ) ? undefined : (
            <ContrarionIndexComponent />
          )}
        </Flex>
      </Flex>
      {isVoteOwner && !!address && (
        <VotingReasonModal
          form={{
            isLoading: isSavingReason,
            delegateAddress: address,
            proposalId: selectedProposal.proposalId,
            proposalTitle: selectedProposal.proposalTitle,
            source: selectedProposal.source,
            onSubmit: handleSubmitVotingReason,
          }}
          onClose={toggleModal}
          isOpen={votingReasonModalOpen}
        />
      )}
    </>
  );
};
