import { useDAO } from 'contexts';
import { RARI_MAINNET_CONTRACTS } from 'resources/rari/constants';

export const useRariConfig = () => {
  const { daoInfo } = useDAO();

  // Get RARI-specific configuration
  const customDelegation = daoInfo.config.CUSTOM_DELEGATION;

  // Check if custom delegation is enabled for this DAO
  const hasCustomDelegation =
    customDelegation?.ENABLE_CUSTOM_DELEGATION ?? false;

  // Get contract addresses (fallback to constants if not in config)
  const contracts = {
    RARI_TOKEN:
      customDelegation?.MAINNET_CONTRACTS?.RARI_TOKEN ??
      RARI_MAINNET_CONTRACTS.RARI_TOKEN,
    VE_RARI_TOKEN:
      customDelegation?.MAINNET_CONTRACTS?.VE_RARI_TOKEN ??
      RARI_MAINNET_CONTRACTS.VE_RARI_TOKEN,
  };

  // Get chain configurations
  const primaryChain = customDelegation?.PRIMARY_DELEGATION_CHAIN ?? 1; // Default to mainnet
  const secondaryChain = customDelegation?.SECONDARY_DELEGATION_CHAIN;

  return {
    hasCustomDelegation,
    contracts,
    primaryChain,
    secondaryChain,
    isRariDAO: daoInfo.config.DAO_KARMA_ID === 'rarifoundation',
  };
};
