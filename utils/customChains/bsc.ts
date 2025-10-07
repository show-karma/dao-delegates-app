import { bsc } from 'wagmi/chains';

export const customBSC = {
  ...bsc,
  rpcUrls: {
    public: {
      http: [
        `https://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ],
      webSocket: [
        `wss://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ],
    },
    default: {
      http: [
        `https://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ],
      webSocket: [
        `wss://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ],
    },
  },
};
