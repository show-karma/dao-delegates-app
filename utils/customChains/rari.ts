import { Chain } from 'wagmi/chains';

export const rari: Chain = {
  id: 1_380_012_617,
  name: 'RARI Chain',
  network: 'rari-mainnet',
  nativeCurrency: {
    name: 'Ether', // The backend script indicates ETH as the currency for subgraphs.
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.rpc.rarichain.org/http'],
      webSocket: ['wss://mainnet.rpc.rarichain.org/ws'],
    },
    public: {
      http: ['https://mainnet.rpc.rarichain.org/http'],
      webSocket: ['wss://mainnet.rpc.rarichain.org/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RARIscan',
      url: 'https://mainnet.explorer.rarichain.org',
    },
  },
  testnet: false,
};
