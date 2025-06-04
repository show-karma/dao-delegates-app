import React from 'react';
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { useDAO } from 'contexts';
import { getEASChainInfo, talismanWallet } from 'utils';
import { optimism } from 'wagmi/chains';

interface ProviderProps {
  children: React.ReactNode;
}

export const RainbowWrapper: React.FC<ProviderProps> = ({ children }) => {
  const { daoInfo } = useDAO();

  const { config } = daoInfo;

  // Create a jsonRpcProvider that supports all chains including custom ones
  const customRpcProvider = jsonRpcProvider({
    rpc: chain => {
      // Check if the chain has rpcUrls defined
      if (chain.rpcUrls?.default?.http?.[0]) {
        return {
          http: chain.rpcUrls.default.http[0],
        };
      }
      // Fallback to public RPC if available
      if (chain.rpcUrls?.public?.http?.[0]) {
        return {
          http: chain.rpcUrls.public.http[0],
        };
      }
      // Return null if no RPC URL is found
      return null;
    },
  });

  const rpcs = [
    process.env.NEXT_PUBLIC_ALCHEMY_KEY
      ? alchemyProvider({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
        })
      : publicProvider(),
    customRpcProvider, // Add the custom RPC provider
    config.CUSTOM_RPC ? config.CUSTOM_RPC : null,
  ].filter(item => item !== null);

  const endorseChain = getEASChainInfo(config.DAO_KARMA_ID).chain;

  const chainWithEndorsedChain = config.DAO_CHAINS.concat([endorseChain]);

  const setChains = config.DAO_CHAINS.find(item => item.id === optimism.id)
    ? chainWithEndorsedChain
    : chainWithEndorsedChain.concat([optimism]);

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    setChains,
    rpcs
  );

  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet({
          chains,
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
        }),
        rainbowWallet({
          chains,
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
        }),
        coinbaseWallet({
          chains,
          appName: `${config.DAO}'s Delegates Watcher`,
        }),
        walletConnectWallet({
          version: '2',
          chains,
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
          options: {
            qrModalOptions: {
              themeVariables: {
                '--wcm-z-index': '9999',
              },
            },
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
          },
        }),
        talismanWallet({ chains }),
        injectedWallet({ chains }),
      ],
    },
  ]);

  const wagmiClient = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
  });

  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};
