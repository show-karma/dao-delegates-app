import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import {
  RARI_MAINNET_CONTRACTS,
  RARI_TARGET_CHAIN_ID,
} from 'resources/rari/constants';
import RARI_TOKEN_ABI from 'resources/rari/MAINNET_TOKEN.json';
import { formatNumber } from 'utils';
import { useToasty } from './useToasty';
import { useRariNetwork } from './useRariNetwork';

interface UseRariTokenProps {
  amountToApprove?: string;
}

export const useRariToken = ({ amountToApprove }: UseRariTokenProps = {}) => {
  const { address: userAddress } = useAccount();
  const { toast } = useToasty();
  const { isCorrectNetwork, switchToMainnet } = useRariNetwork();

  // Only enable contract reads when on correct network
  const contractsEnabled = !!userAddress && isCorrectNetwork;

  // Fetch user's RARI balance
  const { data: rariBalance, refetch: refetchBalance } = useContractRead({
    address: RARI_MAINNET_CONTRACTS.RARI_TOKEN,
    abi: RARI_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: contractsEnabled,
    chainId: RARI_TARGET_CHAIN_ID,
    watch: true,
  });

  // Fetch current allowance granted to veRARI contract
  const { data: rariAllowance, refetch: refetchAllowance } = useContractRead({
    address: RARI_MAINNET_CONTRACTS.RARI_TOKEN,
    abi: RARI_TOKEN_ABI,
    functionName: 'allowance',
    args: [userAddress, RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN],
    enabled: contractsEnabled,
    chainId: RARI_TARGET_CHAIN_ID,
    watch: true,
  });

  // Prepare approve transaction with the exact amount user wants to lock
  const { config: approveConfig } = usePrepareContractWrite({
    address: RARI_MAINNET_CONTRACTS.RARI_TOKEN,
    abi: RARI_TOKEN_ABI,
    functionName: 'approve',
    args: [
      RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN,
      amountToApprove ? parseEther(amountToApprove).toString() : '0',
    ],
    enabled:
      contractsEnabled && !!amountToApprove && parseFloat(amountToApprove) > 0,
    chainId: RARI_TARGET_CHAIN_ID,
  });

  // Execute approve transaction
  const {
    data: approveData,
    isLoading: isApproveLoading,
    write: approveWrite,
  } = useContractWrite({
    ...approveConfig,
    onError(error) {
      console.log('Approve error:', error);
      if (
        error.stack?.includes('code=ACTION_REJECTED') ||
        error.stack?.includes('code=4001') ||
        error.message.includes('User rejected')
      ) {
        toast({
          title: 'Error',
          description:
            'The approval transaction was cancelled. Please try again.',
          status: 'error',
        });
      } else {
        toast({
          title: 'Error',
          description: 'The approval transaction failed. Please try again.',
          status: 'error',
        });
      }
    },
  });

  // Wait for approve transaction confirmation
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransaction({
      hash: approveData?.hash,
      onSuccess() {
        toast({
          title: 'Success',
          description:
            'RARI approval successful! You can now lock your tokens.',
          status: 'success',
        });
        refetchAllowance();
      },
      onError(error) {
        console.log('Approve confirmation error:', error);
        toast({
          title: 'Error',
          description: 'Approval transaction failed during confirmation.',
          status: 'error',
        });
      },
    });

  // Helper function to check if amount needs approval
  const needsApproval = (amountToLock: string): boolean => {
    if (!rariAllowance || !amountToLock) return true;
    try {
      const requiredAmount = parseEther(amountToLock);
      return BigNumber.from(rariAllowance).lt(requiredAmount);
    } catch {
      return true;
    }
  };

  // Helper function to format balance for display
  const formatBalance = (balance: BigNumber | undefined): string => {
    if (!balance) return '0';
    try {
      //   return parseFloat(formatEther(balance)).toFixed(2);
      return formatNumber(formatEther(balance));
    } catch {
      return '0';
    }
  };

  // Network-aware approve function
  const approveRariWithNetworkCheck = async () => {
    const switched = await switchToMainnet();
    console.log('switched', switched);
    if (switched) {
      approveWrite?.();
    }
  };

  return {
    // Data
    rariBalance: rariBalance as BigNumber | undefined,
    rariAllowance: rariAllowance as BigNumber | undefined,
    formattedBalance: formatBalance(rariBalance as BigNumber | undefined),

    // Functions
    approveRari: approveRariWithNetworkCheck,
    needsApproval,
    refetchBalance,
    refetchAllowance,

    // Loading states
    isApproveLoading: isApproveLoading || isApproveConfirming,
    isApproveSuccess,

    // Network state
    isCorrectNetwork,
  };
};
