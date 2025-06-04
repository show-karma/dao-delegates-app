import { useAccount, useContractRead } from 'wagmi';
import { formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { useRariConfig, useRariNetwork } from 'hooks';
import RARI_TOKEN_ABI from 'resources/rari/MAINNET_TOKEN.json'; // Same ABI for both networks

export const useRarichainToken = () => {
  const { address: userAddress } = useAccount();
  const { isOnRarichain } = useRariNetwork();
  const { secondaryChain } = useRariConfig();

  // Only enable contract reads when on Rarichain
  const contractsEnabled = !!userAddress && isOnRarichain;

  // Fetch user's RARI balance on Rarichain
  const { data: rariBalance, refetch: refetchBalance } = useContractRead({
    address: '0xCf78572A8fE97b2B9a4B9709f6a7D9a863c1b8E0', // Rarichain RARI token address
    abi: RARI_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: contractsEnabled,
    chainId: secondaryChain,
    watch: true,
  });

  // Helper function to format balance for display
  const formatBalance = (balance: BigNumber | undefined): string => {
    if (!balance) return '0.00';
    try {
      return parseFloat(formatEther(balance)).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  return {
    // Data
    rariBalance: rariBalance as BigNumber | undefined,
    formattedBalance: formatBalance(rariBalance as BigNumber | undefined),

    // Functions
    refetchBalance,

    // Network state
    isOnRarichain,
  };
};
