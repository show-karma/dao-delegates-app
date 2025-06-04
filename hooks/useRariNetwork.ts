import { useNetwork, useSwitchNetwork } from 'wagmi';
import { RARI_TARGET_CHAIN_ID } from 'resources/rari/constants';
import { useToasty } from './useToasty';
import { useRariConfig } from './useRariConfig';

export const useRariNetwork = () => {
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { toast } = useToasty();
  const { primaryChain, secondaryChain } = useRariConfig();

  // Check if user is on any supported RARI network
  const isOnMainnet = chain?.id === primaryChain; // Ethereum Mainnet
  const isOnRarichain = chain?.id === secondaryChain; // Rarichain
  const isOnSupportedNetwork = isOnMainnet || isOnRarichain;

  // Legacy compatibility - keep for existing code that checks mainnet specifically
  const isCorrectNetwork = isOnMainnet;

  // Function to switch to a specific network
  const switchToNetwork = async (
    targetChainId: number,
    networkName: string
  ): Promise<boolean> => {
    if (chain?.id === targetChainId) return true;

    try {
      if (!switchNetworkAsync) {
        toast({
          title: 'Network Switch Required',
          description: `Please manually switch to ${networkName} in your wallet.`,
          status: 'warning',
          duration: 5000,
        });
        return false;
      }

      await switchNetworkAsync(targetChainId);

      toast({
        title: 'Network Switched',
        description: `Successfully switched to ${networkName}.`,
        status: 'success',
      });

      return true;
    } catch (error: any) {
      console.error('Network switch error:', error);

      // Handle user rejection
      if (
        error?.message?.includes('User rejected') ||
        error?.message?.includes('rejected') ||
        error?.message?.includes('denied')
      ) {
        toast({
          title: 'Network Switch Cancelled',
          description: `You need to be on ${networkName} to use this delegation method.`,
          status: 'warning',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Network Switch Failed',
          description: `Failed to switch to ${networkName}. Please try again.`,
          status: 'error',
          duration: 5000,
        });
      }

      return false;
    }
  };

  // Convenience functions for specific networks
  const switchToMainnet = () =>
    switchToNetwork(primaryChain, 'Ethereum Mainnet');
  const switchToRarichain = () =>
    switchToNetwork(secondaryChain || 0, 'Rarichain');

  // Get the current network name for display
  const getCurrentNetworkName = (): string => {
    if (!chain) return 'Unknown Network';
    if (chain.id === primaryChain) return 'Ethereum Mainnet';
    if (chain.id === secondaryChain) return 'Rarichain';
    return chain.name || `Chain ${chain.id}`;
  };

  // Get network-specific delegation type
  const getDelegationType = (): 'veRARI' | 'direct' | 'unsupported' => {
    if (isOnMainnet) return 'veRARI';
    if (isOnRarichain) return 'direct';
    return 'unsupported';
  };

  return {
    // Network status
    isOnMainnet,
    isOnRarichain,
    isOnSupportedNetwork,
    isCorrectNetwork, // Legacy compatibility
    currentNetwork: chain,
    currentNetworkName: getCurrentNetworkName(),
    delegationType: getDelegationType(),

    // Network switching
    switchToMainnet,
    switchToRarichain,
    switchToNetwork,

    // Network info
    primaryChain,
    secondaryChain,
    targetNetworkName: 'Ethereum Mainnet', // Legacy compatibility
    targetChainId: RARI_TARGET_CHAIN_ID, // Legacy compatibility
  };
};
