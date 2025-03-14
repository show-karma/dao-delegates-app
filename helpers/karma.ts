export const KARMA_API = {
  base_url: process.env.NEXT_PUBLIC_KARMA_API || '',
};

export const KARMA_WEBSITE = {
  home: 'https://karmahq.xyz',
  delegators: (daoName: string, profile?: string) =>
    `https://karmahq.xyz/dao/${daoName}/delegators${
      profile ? `/${profile}` : ''
    }`,
};

export const KARMA_LINKS = {
  discord: 'https://discord.com/invite/hnZm3MffqQ',
  twitter: 'https://twitter.com/karmahq_',
  mirror: 'https://mirror.xyz/showkarma.eth',
  linkedin: 'https://www.linkedin.com/company/karmaxyz/',
};

export const API_ROUTES = {
  DAO: {
    TRACKS: (daoName: string) => `${KARMA_API.base_url}/dao/${daoName}/tracks`,
  },
  USER: {
    GET_USER: (address: string) => `${KARMA_API.base_url}/user/${address}`,
    PROXY: (address: string) =>
      `${KARMA_API.base_url}/user/proxy-wallet/${address}`,
    DELETE_PROXY: `${KARMA_API.base_url}/user/remove/proxy-wallet`,
  },
  DELEGATE: {
    TERMS_OF_SERVICE: (daoName: string) =>
      `${KARMA_API.base_url}/delegate/${daoName}/terms-of-service`,
    TERMS_OF_AGREEMENT: (daoName: string) =>
      `${KARMA_API.base_url}/delegate/${daoName}/terms-of-agreement`,
    GET_TERMS_OF_SERVICE: (daoName: string, address: string) =>
      `${KARMA_API.base_url}/delegate/${daoName}/terms-of-agreement/${address}`,
    CHANGE_TRACKS: (daoName: string, address: string) =>
      `${KARMA_API.base_url}/delegate/${daoName}/${address}/assign-tracks`,
    CHANGE_INCENTIVE_PROGRAM_STATS: (daoName: string, id: string | number) =>
      `${KARMA_API.base_url}/delegate/${daoName}/${id}/incentive-programs-stats`,
    CALCULATE_BONUS_POINTS: (daoName: string, month: number, year: number) =>
      `${KARMA_API.base_url}/delegate/calculate-bonus-points/${daoName}/${month}/${year}`,
  },
};

export const YOUTUBE_LINKS = {
  DISCORD_LINKING: 'https://www.youtube.com/watch?v=UXDmZ8bN4Sg',
};
