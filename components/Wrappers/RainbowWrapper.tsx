import React from 'react';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { useDAO } from 'contexts';

interface ProviderProps {
  children: React.ReactNode;
}

export const RainbowWrapper: React.FC<ProviderProps> = ({ children }) => {
  const { daoInfo } = useDAO();
  const { config } = daoInfo;

  const { chains, provider } = configureChains(
    [config.DAO_CHAIN],
    [publicProvider()]
  );

  const { connectors } = getDefaultWallets({
    appName: `${config.DAO}'s Delegates Watcher`,
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};
