import { useDAO, useDelegates, useGovernanceVotes, useWallet } from 'contexts';
import { IDelegation } from 'types';
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useMixpanel } from './useMixpanel';
import { useToasty } from './useToasty';

export const useDelegation = (args: IDelegation) => {
  const { delegatee, onSuccessFunction, chosenContract } = args;
  const { daoInfo } = useDAO();
  const { fetchDelegates, refreshProfileModal, profileSelected } =
    useDelegates();
  const { getDelegatedBefore } = useGovernanceVotes();
  const { delegateOnClose } = useWallet();

  const getArgs = () => {
    const functionArgs = daoInfo.config.DAO_DELEGATE_FUNCTION_ARGS;
    if (!functionArgs) return [delegatee];
    return functionArgs.concat([delegatee]);
  };

  const { mixpanel } = useMixpanel();

  const { chain } = useNetwork();

  const { config } = usePrepareContractWrite({
    address:
      chosenContract ||
      daoInfo.config.DAO_DELEGATE_CONTRACT?.find(
        contract => contract.chain.id === (args.network || chain?.id)
      )?.contractAddress[0],
    abi: daoInfo.DELEGATE_ABI,
    functionName: daoInfo.config.DAO_DELEGATE_FUNCTION || 'delegate',
    args: getArgs(),
    chainId: args.network || chain?.id,
  });

  const { toast } = useToasty();

  const {
    data,
    isLoading: isWriteLoading,
    write,
  } = useContractWrite({
    ...config,
    onError(error) {
      // eslint-disable-next-line no-console
      console.log(error);
      if (
        error.stack?.includes('code=ACTION_REJECTED') ||
        error.stack?.includes('code=4001') ||
        error.message.includes('User rejected')
      ) {
        toast({
          title: 'Error',
          description: 'The transaction was cancelled. Please try again.',
          status: 'error',
        });
      } else {
        toast({
          title: 'Error',
          description: 'The transaction goes wrong...',
          status: 'error',
        });
      }
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    confirmations: 1, // Wait for at least 1 confirmation
    onSuccess() {
      mixpanel.reportEvent({
        event: 'delegateapp.tokenDelegated',
      });
      toast({
        title: 'Success',
        description: 'You successfully delegated your tokens!',
        status: 'success',
      });

      getDelegatedBefore();

      if (
        profileSelected &&
        profileSelected.address.toLowerCase() === delegatee.toLowerCase()
      ) {
        refreshProfileModal();
      }

      fetchDelegates(0);

      onSuccessFunction?.();
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.log('Transaction confirmation error:', error);
      toast({
        title: 'Error',
        description:
          'Transaction failed during confirmation. Please check your transaction.',
        status: 'error',
      });
    },
  });

  // Combine loading states: writing transaction + confirming transaction
  const isLoading = isWriteLoading || isConfirming;

  return { data, isLoading, isSuccess, write };
};
