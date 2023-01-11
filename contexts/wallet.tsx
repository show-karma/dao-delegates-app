import React, { useContext, createContext, useMemo } from 'react';

import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { Chain, useAccount, useNetwork } from 'wagmi';
import { useIsMounted } from 'hooks/useIsMounted';

interface IWalletProps {
  isConnected: boolean;
  openConnectModal: (() => void) | undefined;
  openChainModal: (() => void) | undefined;
  chain:
    | (Chain & {
        unsupported?: boolean | undefined;
      })
    | undefined;
}

export const WalletContext = createContext({} as IWalletProps);

interface ProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<ProviderProps> = ({ children }) => {
  const isMounted = useIsMounted();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const providerValue = useMemo(
    () => ({
      isConnected,
      openConnectModal,
      openChainModal,
      chain,
    }),
    [isConnected, openConnectModal, openChainModal, chain]
  );

  return isMounted ? (
    <WalletContext.Provider value={providerValue}>
      {children}
    </WalletContext.Provider>
  ) : null;
};

export const useWallet = () => useContext(WalletContext);
