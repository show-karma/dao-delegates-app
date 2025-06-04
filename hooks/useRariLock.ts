import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { parseEther } from 'ethers/lib/utils';
import {
  RARI_MAINNET_CONTRACTS,
  RARI_TARGET_CHAIN_ID,
} from 'resources/rari/constants';
import VE_RARI_ABI from 'resources/rari/MAINNET_DELEGATE_TOKEN.json';
import { useToasty } from './useToasty';
import { useRariNetwork } from './useRariNetwork';

interface UseRariLockProps {
  amount: string;
  delegateAddress: string;
  slopePeriod: number;
  cliff: number;
}

export const useRariLock = ({
  amount,
  delegateAddress,
  slopePeriod,
  cliff,
}: UseRariLockProps) => {
  const { address: userAddress } = useAccount();
  const { toast } = useToasty();
  const { isCorrectNetwork, switchToMainnet } = useRariNetwork();

  // Only enable contract writes when on correct network
  const contractsEnabled =
    !!userAddress && !!delegateAddress && !!amount && isCorrectNetwork;

  // Prepare lock transaction
  const { config: lockConfig } = usePrepareContractWrite({
    address: RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN,
    abi: VE_RARI_ABI,
    functionName: 'lock',
    args: [
      userAddress, // account
      delegateAddress, // _delegate
      parseEther(amount || '0').toString(), // amount
      slopePeriod, // slopePeriod
      cliff, // cliff
    ],
    enabled: contractsEnabled,
    chainId: RARI_TARGET_CHAIN_ID,
  });

  // Execute lock transaction
  const {
    data,
    isLoading: isWriteLoading,
    write: lockWrite,
  } = useContractWrite({
    ...lockConfig,

    onError(error) {
      console.log('Lock error:', error);
      if (
        error.stack?.includes('code=ACTION_REJECTED') ||
        error.stack?.includes('code=4001') ||
        error.message.includes('User rejected')
      ) {
        toast({
          title: 'Error',
          description: 'The lock transaction was cancelled. Please try again.',
          status: 'error',
        });
      } else {
        toast({
          title: 'Error',
          description: 'The lock transaction failed. Please try again.',
          status: 'error',
        });
      }
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    confirmations: 1,
    chainId: RARI_TARGET_CHAIN_ID,
    onSuccess() {
      toast({
        title: 'Success',
        description: `Successfully locked ${amount} RARI and delegated to ${delegateAddress}!`,
        status: 'success',
      });
    },
    onError(error) {
      console.log('Lock confirmation error:', error);
      toast({
        title: 'Error',
        description: 'Lock transaction failed during confirmation.',
        status: 'error',
      });
    },
  });

  const isLoading = isWriteLoading || isConfirming;

  // Network-aware lock function
  const lockRariWithNetworkCheck = async () => {
    const switched = await switchToMainnet();
    if (switched && lockWrite) {
      lockWrite();
    }
  };

  return {
    lockRari: lockRariWithNetworkCheck,
    isLoading,
    isSuccess,
    transactionHash: data?.hash,
    isCorrectNetwork,
  };
};
