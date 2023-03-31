import { IDAOConfig, IDAOTheme } from 'types';
import { mainnet } from 'wagmi/chains';

const config: IDAOConfig = {
  DAO: 'Starknet',
  DAO_DESCRIPTION: `Starknet delegates play a vital role in decentralizing the upgrade process for Starknet mainnet. Delegates vote to approve protocol upgrades before they go live on mainnet. Read more about delegate responsibilities here.`,
  DAO_SUBDESCRIPTION: `This site helps token holders choose delegates and boost transparency by displaying delegate contribution to indicate their involvement in the DAO.`,
  DAO_URL: 'https://starkware.co/starknet',
  GOVERNANCE_FORUM: 'https://community.starknet.io/',
  DAO_KARMA_ID: 'starknet',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/starknet/logo.svg',
  METATAGS: {
    TITLE: `Delegates of Starknet DAO`,
    DESCRIPTION: `Find all the active delegates in Starknet DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE: '/daos/starknet/meta.png',
    FAVICON: '/daos/starknet/favicon.svg',
    URL: `https://starknet.karmahq.xyz`,
  },
  DAO_DEFAULT_SETTINGS: {
    ORDERSTAT: 'votingWeight',
    SORT: 'delegatedVotes',
  },
  DAO_CHAIN: mainnet,
  DAO_DELEGATE_CONTRACT: undefined,
  DAO_DELEGATE_MODE: 'snapshot',
  DAO_FORUM_TYPE: 'discourse',
  DAO_GTAG: 'G-67LDHT697P',
  HEADER_MARGIN: true,
  EXCLUDED_CARD_FIELDS: [
    'onChainVotesPct',
    'healthScore',
    'discordScore',
    'karmaScore',
    'delegatorCount',
  ],
};

const dark: IDAOTheme = {
  background: '#1C1C3B',
  bodyBg: '#1C1C3B',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#1C1C3B',
  buttonText: '#FFFFFF',
  buttonTextSec: '#FFFFFF',
  headerBg: '#1C1C3B',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#FFFFFF', subtext: '#ADB8C0', bg: '#2D2E49' },
  secondaryButton: {
    bg: '#FFFFFF',
    text: '#222429',
  },
  secondBg: '#2D2E49',
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
    listBg: '#222429',
    listText: 'white',
    bg: '#1C1C3B',
    activeBg: 'rgba(102, 102, 102, 0.15)',
  },
  card: {
    icon: '#ADB8C0',
    background: '#2D2E49',
    statBg: 'rgba(102, 102, 102, 0.15)',
    divider: 'rgba(173, 184, 192, 0.2)',
    text: { primary: '#FFFFFF', secondary: '#ADB8C0' },
    border: '#403E4F',
    common: '#727B81',
    interests: { bg: 'rgba(255, 255, 255, 0.05)', text: '#ADB8C0' },
    workstream: { bg: '#FFFFFF', text: '#222429' },
    socialMedia: '#FFFFFF',
  },
  loginModal: {
    background: '#1A2835',
    text: '#FFFFFF',
    footer: { bg: 'rgba(102, 102, 102, 0.15)', text: '#FFFFFF' },
    button: {
      bg: '#28286E',
      text: '#FFFFFF',
    },
  },
  modal: {
    background: '#222429',
    header: {
      border: '#ADB8C0',
      title: '#FFFFFF',
      subtitle: '#ADB8C0',
      twitter: '#ADB8C0',
      divider: 'rgba(173, 184, 192, 0.2)',
    },
    buttons: {
      selectBg: '#C80925',
      selectText: '#FFFFFF',
      navBg: '#34383f',
      navText: '#FFFFFF',
      navUnselectedText: '#ADB8C0',
      navBorder: '#FFFFFF',
    },
    statement: {
      headline: '#FFFFFF',
      text: '#ADB8C0',
      sidebar: {
        section: '#FFFFFF',
        subsection: '#FFFFFF',
        text: '#ADB8C0',
        item: {
          bg: 'transparent',
          text: '#FFFFFF',
          border: '#ADB8C0',
        },
      },
    },
    delegateTo: {
      bg: '#FFFFFF',
      userBg: '#FFFFFF',
      userShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      topBg: '#EBEDEF',
      text: '#212328',
      subtext: '#595A5E',
      input: {
        placeholder: '#595A5E',
        text: '#212328',
        dirtyBorder: '#212328',
        border: '#E6E6E6',
        error: '#C80925',
        bg: '#FFFFFF',
      },
      button: {
        disabled: {
          bg: '#F2F4F9',
          text: 'rgba(89, 90, 94, 0.5)',
        },
        normal: {
          bg: '#C80925',
          text: '#FFFFFF',
        },
        alternative: {
          bg: 'transparent',
          text: '#212328',
          border: '#595A5E',
        },
      },
    },
    votingHistory: {
      headline: '#FFFFFF',
      divider: '#E6E6E6',
      proposal: {
        title: '#FFFFFF',
        type: '#ADB8C0',
        date: '#ADB8C0',
        result: '#FFFFFF',
        verticalDivider: 'rgba(173, 184, 192, 0.5)',
        divider: 'rgba(173, 184, 192, 0.2)',
        icons: {
          for: 'green.300',
          against: 'red.500',
          abstain: 'gray.300',
          notVoted: 'gray.300',
          multiple: 'green.300',
        },
        bg: '#34383f',
      },
      modules: {
        chart: {
          point: '#FFFFFF',
          openGradient: '#666e7a',
          endGradient: '#34383f',
        },
      },
      reason: {
        title: '#FFFFFF',
        text: '#ADB8C0',
        divider: 'rgba(173, 184, 192, 0.2)',
      },
      navigation: {
        color: '#ADB8C0',
        buttons: {
          selectedBg: '#ADB8C0',
          selectedText: '#222429',
          unSelectedBg: 'transparent',
          unSelectedText: '#ADB8C0',
        },
      },
    },
  },
  tokenHolders: {
    border: '#FFFFFF4D',
    bg: 'transparent',
    list: {
      text: {
        primary: '#FFFFFF',
        secondary: '#FFFFFF4D',
      },
      bg: {
        primary: '#1C1C3B',
        secondary: '#1C1C3B80',
      },
    },
    delegations: {
      text: {
        primary: '#FFFFFF',
        secondary: '#ADB8C0',
        placeholder: {
          main: '#ADB8C0',
          comma: '#ADB8C0',
        },
      },
      chart: {
        point: '#B999FF',
        datasetColor: '#35364D',
      },
      bg: {
        primary: '#1C1C3B',
        secondary: '#747b87',
        tertiary: '#FFFFFF20',
        quaternary: '#1C1C3B80',
      },
    },
  },
};

const light: IDAOTheme = {
  logo: '/daos/starknet/logo_black.svg',
  background: '#F2F4F9',
  bodyBg: '#F2F4F9',
  title: '#222429',
  subtitle: '#666666',
  text: '#222429',
  branding: '#2D2E49',
  buttonText: '#FFFFFF',
  buttonTextSec: '#222429',
  headerBg: '#2D2E49',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#2D2E49', subtext: '#222429', bg: '#FFFFFF' },
  secondaryButton: {
    bg: '#1C1C3B',
    text: '#FFFFFF',
  },
  hat: {
    text: {
      primary: '#FFFFFF',
      secondary: '#ADB8C0',
      madeBy: '#ADB8C0',
      lastUpdated: '#666666',
    },
  },
  filters: {
    head: '#666666',
    border: '#ADB8C033',
    title: '#666666',
    listBg: '#FFFFFF',
    listText: '#666666',
    bg: '#FFFFFF',
    activeBg: '#EBEDEF',
  },
  card: {
    icon: '#ADB8C0',
    background: '#FFFFFF',
    statBg: '#EBEDEF',
    divider: 'rgba(102, 102, 102, 0.5)',
    text: { primary: '#212328', secondary: '#666666' },
    border: 'none',
    shadow: '0px 0px 4px rgba(0, 0, 0, 0.1)',
    common: '#727B81',
    interests: { bg: '#EBEDEF', text: '#2C2E32' },
    workstream: { bg: '#595A5E', text: '#FFFFFF' },
    socialMedia: '#595A5E',
  },
  loginModal: {
    background: '#FFFFFF',
    text: '#212328',
    footer: { bg: '#EBEDEF', text: '#212328' },
    button: {
      bg: '#28286E',
      text: '#FFFFFF',
    },
  },
  modal: {
    background: '#222429',
    header: {
      border: '#ADB8C0',
      title: '#FFFFFF',
      subtitle: '#ADB8C0',
      twitter: '#ADB8C0',
      divider: 'rgba(173, 184, 192, 0.2)',
    },
    buttons: {
      selectBg: '#C80925',
      selectText: '#FFFFFF',
      navBg: '#34383f',
      navText: '#FFFFFF',
      navUnselectedText: '#ADB8C0',
      navBorder: '#FFFFFF',
    },
    statement: {
      headline: '#FFFFFF',
      text: '#ADB8C0',
      sidebar: {
        section: '#FFFFFF',
        subsection: '#FFFFFF',
        text: '#ADB8C0',
        item: {
          bg: 'transparent',
          text: '#FFFFFF',
          border: '#ADB8C0',
        },
      },
    },
    delegateTo: {
      bg: '#FFFFFF',
      userBg: '#FFFFFF',
      userShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      topBg: '#EBEDEF',
      text: '#212328',
      subtext: '#595A5E',
      input: {
        placeholder: '#595A5E',
        text: '#212328',
        dirtyBorder: '#212328',
        border: '#E6E6E6',
        error: '#C80925',
        bg: '#FFFFFF',
      },
      button: {
        disabled: {
          bg: '#F2F4F9',
          text: 'rgba(89, 90, 94, 0.5)',
        },
        normal: {
          bg: '#C80925',
          text: '#FFFFFF',
        },
        alternative: {
          bg: 'transparent',
          text: '#212328',
          border: '#595A5E',
        },
      },
    },
    votingHistory: {
      headline: '#FFFFFF',
      divider: '#E6E6E6',
      proposal: {
        title: '#FFFFFF',
        type: '#ADB8C0',
        date: '#ADB8C0',
        result: '#FFFFFF',
        verticalDivider: 'rgba(173, 184, 192, 0.5)',
        divider: 'rgba(173, 184, 192, 0.2)',
        icons: {
          for: '#FFFFFF',
          against: '#FFFFFF',
          abstain: '#FFFFFF',
          notVoted: '#FFFFFF',
          multiple: '#FFFFFF',
        },
        bg: '#34383f',
      },
      modules: {
        chart: {
          point: '#FFFFFF',
          openGradient: '#666e7a',
          endGradient: '#34383f',
        },
      },
      reason: {
        title: '#FFFFFF',
        text: '#ADB8C0',
        divider: 'rgba(173, 184, 192, 0.2)',
      },
      navigation: {
        color: '#ADB8C0',
        buttons: {
          selectedBg: '#ADB8C0',
          selectedText: '#222429',
          unSelectedBg: 'transparent',
          unSelectedText: '#ADB8C0',
        },
      },
    },
  },
  tokenHolders: {
    border: '#21232833',
    bg: 'transparent',
    list: {
      text: {
        primary: '#212328',
        secondary: '#2123284D',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#ededef',
      },
    },
    delegations: {
      text: {
        primary: '#212328',
        secondary: '#292E41',
        placeholder: {
          main: '#21232830',
          comma: '#ADB8C0',
        },
      },
      chart: {
        point: '#292E41',
        datasetColor: '#1C1C3B40',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#ededef',
        tertiary: '#dadada',
        quaternary: '#292E4180',
      },
    },
  },
};

const dao = { dark, light, config };

export default dao;
