export const moonbeam = {
  id: 1284,
  name: 'Moonbeam',
  network: 'moonbeam',
  nativeCurrency: {
    decimals: 18,
    name: 'GLMR',
    symbol: 'GLMR',
  },
  rpcUrls: {
    public: {
      http: ['https://rpc.api.moonbeam.network'],
      webSocket: ['wss://wss.api.moonbeam.network'],
    },
    default: {
      http: ['https://rpc.api.moonbeam.network'],
      webSocket: ['wss://wss.api.moonbeam.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Moonscan',
      url: 'https://moonscan.io',
    },
    etherscan: {
      name: 'Moonscan',
      url: 'https://moonscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: 609002,
    },
  },
  testnet: false,
};
