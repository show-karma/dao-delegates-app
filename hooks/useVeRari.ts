import { useAccount, useContractRead } from 'wagmi';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import {
  RARI_MAINNET_CONTRACTS,
  RARI_LOCK_TIMEFRAMES,
  RariLockTimeframe,
} from 'resources/rari/constants';
import VE_RARI_ABI from 'resources/rari/MAINNET_DELEGATE_TOKEN.json';
import { mainnet } from 'viem/chains';
import { formatNumber } from 'utils';

export const useVeRari = () => {
  const { address: userAddress } = useAccount();

  // Fetch user's veRARI balance
  const { data: veRariBalance, refetch: refetchVeRariBalance } =
    useContractRead({
      address: RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN,
      abi: VE_RARI_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
      enabled: !!userAddress,
      watch: true,
      chainId: mainnet.id,
    });

  // Get user's locks using React Query to fetch LockCreate events
  const { data: userLocks, refetch: refetchUserLocks } = useQuery({
    queryKey: ['userLocks', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      return [];
    },
    enabled: !!userAddress,
  });

  const formatVeRariBalance = (balance: BigNumber | undefined): string => {
    if (!balance) return '0';
    try {
      return formatNumber(formatEther(balance));
    } catch {
      return '0';
    }
  };

  const formatProspectiveVeRari = (getLockResult: any): string => {
    if (!getLockResult || !getLockResult.data) return '0';
    try {
      const lockSlope = getLockResult.data[1];
      return formatNumber(formatEther(lockSlope));
    } catch {
      return '0';
    }
  };

  return {
    // Data
    veRariBalance: veRariBalance as BigNumber | undefined,
    formattedVeRariBalance: formatVeRariBalance(
      veRariBalance as BigNumber | undefined
    ),
    userLocks,

    // Functions
    formatProspectiveVeRari,
    refetchVeRariBalance,
    refetchUserLocks,
  };
};

// Separate hook for getting prospective veRARI amount
export const useProspectiveVeRari = (
  rariAmount: string,
  timeframe: RariLockTimeframe
) =>
  useContractRead({
    address: RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN,
    abi: VE_RARI_ABI,
    functionName: 'getLock',
    args: [
      parseEther(rariAmount || '0').toString(),
      1,
      RARI_LOCK_TIMEFRAMES[timeframe],
    ],
    enabled: !!rariAmount && parseFloat(rariAmount) > 0,
    chainId: mainnet.id,
  });
