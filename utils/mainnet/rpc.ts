import { Chain } from 'wagmi/chains';

export const mainnet: Chain = {
  id: 1,
  name: 'Ethereum',
  network: 'homestead',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: process.env.NEXT_PUBLIC_ALCHEMY_KEY
        ? [
            `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
          ]
        : [],
      webSocket: process.env.NEXT_PUBLIC_ALCHEMY_KEY
        ? [
            `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
          ]
        : [],
    },
    default: {
      http: process.env.NEXT_PUBLIC_ALCHEMY_KEY
        ? [
            `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
          ]
        : [],
      webSocket: process.env.NEXT_PUBLIC_ALCHEMY_KEY
        ? [
            `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
          ]
        : [],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
    etherscan: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://eth.blockscout.com',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da',
      blockCreated: 16773775,
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 14353601,
    },
  },
  testnet: false,
};
