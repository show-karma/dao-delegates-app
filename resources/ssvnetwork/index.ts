import { IDAOConfig, IDAOTheme } from 'types';
import { chain } from 'wagmi';

const config: IDAOConfig = {
  DAO: 'SSV Network',
  DAO_DESCRIPTION: `The Delegates of DAO play a vital role in driving the SSV Network ecosystem forward through their work in governance and workstreams.`,
  DAO_SUBDESCRIPTION: `This site will help boost transparency with health cards for each Delegate that display metrics and links on their involvement and engagement in the DAO.`,
  DAO_URL: 'https://ssv.network',
  GOVERNANCE_FORUM: 'https://forum.ssv.network',
  DAO_KARMA_ID: 'ssvnetwork',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/ssvnetwork/logo.svg',
  METATAGS: {
    TITLE: `Delegates of SSV Network DAO`,
    DESCRIPTION: `Find all the active delegates in SSV Network DAO along with governance stats across off-chain, forum and discord.`,
    IMAGE: '/daos/ssvnetwork/meta.png',
    FAVICON: '/daos/ssvnetwork/favicon.png',
    URL: `https://ssvnetwork.showkarma.xyz`,
  },
  DAO_CHAIN: chain.mainnet,
  DAO_DELEGATE_CONTRACT: '',
  FEATURED_CARD_FIELDS: ['delegatedVotes', 'offChainVotesPct'],
  EXCLUDED_CARD_FIELDS: ['onChainVotesPct'],
};

// const theme: IDAOTheme = {
//   background: '#011627',
//   card: '#0b2a3c',
//   title: '#FFFFFF',
//   subtitle: '#FFFFFF',
//   text: '#FFFFFF',
//   buttonText: '#FFFFFF',
//   branding: '#1ba5f8',
// };

const dark: IDAOTheme = {
  background: '#14171A',
  bodyBg: '#14171A',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#C80925',
  buttonText: '#FFFFFF',
  buttonTextSec: '#FFFFFF',
  headerBg: '#212328',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  hat: {
    text: {
      primary: '#FFFFFF',
      secondary: '#ADB8C0',
      madeBy: '#FFFFFF',
      lastUpdated: '#ADB8C0',
    },
  },
  filters: {
    head: '#ADB8C0',
    border: '#ADB8C033',
    title: 'white',
    bg: 'transparent',
    listBg: '#222429',
    listText: 'white',
  },
  card: {
    icon: '#ADB8C0',
    background: '#222429',
    featureStatBg: 'rgba(102, 102, 102, 0.15)',
    divider: 'rgba(173, 184, 192, 0.2)',
    text: { primary: '#FFFFFF', secondary: '#ADB8C0' },
    border: '#403E4F',
  },
};

const light: IDAOTheme = {
  background: '#F2F4F9',
  bodyBg: '#F2F4F9',
  title: '#222429',
  subtitle: '#666666',
  text: '#222429',
  branding: '#C80925',
  buttonText: '#FFFFFF',
  buttonTextSec: '#222429',
  headerBg: '#212328',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  hat: {
    text: {
      primary: '#FFFFFF',
      secondary: '#ADB8C0',
      madeBy: '#222429',
      lastUpdated: '#666666',
    },
  },
  filters: {
    head: '#666666',
    border: '#ADB8C033',
    title: '#666666',
    bg: 'transparent',
    listBg: '#FFFFFF',
    listText: '#666666',
  },
  card: {
    icon: '#ADB8C0',
    background: '#FFFFFF',
    featureStatBg: 'transparent',
    divider: 'rgba(102, 102, 102, 0.5)',
    text: { primary: '#212328', secondary: '#666666' },
    border: 'rgba(102, 102, 102, 0.5)',
  },
};

const dao = { dark, light, config };

export default dao;
