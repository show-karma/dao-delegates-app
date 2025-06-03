import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { RARI_MAINNET_CONTRACTS } from 'resources/rari/constants';
import VE_RARI_ABI from 'resources/rari/MAINNET_DELEGATE_TOKEN.json';
import { useToasty } from './useToasty';

interface DelegateLockParams {
  lockId: number;
  newDelegateAddress: string;
  onSuccess?: () => void;
}

export const useVeRariDelegation = (params: DelegateLockParams) => {
  const { address: userAddress } = useAccount();
  const { toast } = useToasty();

  // Prepare delegate transaction
  const { config } = usePrepareContractWrite({
    address: RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN,
    abi: VE_RARI_ABI,
    functionName: 'delegateTo',
    args: [params.lockId, params.newDelegateAddress],
    enabled:
      !!userAddress &&
      !!params.newDelegateAddress &&
      params.lockId !== undefined &&
      params.lockId > 0, // Only enable when we have a valid lock ID
  });

  // Execute delegate transaction
  const {
    data,
    isLoading: isWriteLoading,
    write: delegateWrite,
  } = useContractWrite({
    ...config,
    onError(error) {
      console.log('Delegate error:', error);
      if (
        error.stack?.includes('code=ACTION_REJECTED') ||
        error.stack?.includes('code=4001') ||
        error.message.includes('User rejected')
      ) {
        toast({
          title: 'Error',
          description:
            'The delegation transaction was cancelled. Please try again.',
          status: 'error',
        });
      } else {
        toast({
          title: 'Error',
          description: 'The delegation transaction failed. Please try again.',
          status: 'error',
        });
      }
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    confirmations: 1,
    onSuccess() {
      toast({
        title: 'Success',
        description: 'Successfully delegated your veRARI lock!',
        status: 'success',
      });

      // Call the success callback if provided
      if (params.onSuccess) {
        params.onSuccess();
      }
    },
    onError(error) {
      console.log('Delegation confirmation error:', error);
      toast({
        title: 'Error',
        description: 'Delegation transaction failed during confirmation.',
        status: 'error',
      });
    },
  });

  const isLoading = isWriteLoading || isConfirming;

  return {
    delegateLock: delegateWrite,
    isLoading,
    isSuccess,
    transactionHash: data?.hash,
  };
};
