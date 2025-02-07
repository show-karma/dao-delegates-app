import { IDAOConfig, IDAOTheme } from 'types';
import { onChainDyDxVotesProvider } from 'utils/dydx/onChainDyDxVotesProvider';
import { mainnet } from 'wagmi/chains';
import ABI from './ABI.json';

const config: IDAOConfig = {
  DAO: 'dYdX',
  DAO_DESCRIPTION: `dYdX delegates and members play a vital role in driving the ecosystem forward through their contributions to the community.`,
  DAO_SUBDESCRIPTION: `This dashboard will help scoring and tracking contributors by displaying community member engagements across the dYdX DAO.`,
  DAO_URL: 'https://dydx.foundation/',
  GOVERNANCE_FORUM: 'https://forums.dydx.community',
  DAO_KARMA_ID: 'dydx',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/dydx/logo.svg',
  METATAGS: {
    TITLE: `Delegates of dYdX DAO`,
    DESCRIPTION: `Find all the active delegates in dYdX DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE_DISCORD: 'https://dydx.karmahq.xyz/daos/dydx/preview-discord.png',
    IMAGE_TWITTER: 'https://dydx.karmahq.xyz/daos/dydx/preview-twitter.png',
    FAVICON: '/daos/dydx/favicon.png',
    URL: `https://dydx.karmahq.xyz`,
  },
  DAO_CHAINS: [mainnet],
  DAO_TOKEN_CONTRACT: [
    {
      contractAddress: ['0x92D6C1e31e14520e676a687F0a93788B716BEff5'],
      method: ['balanceOf'],
      chain: mainnet,
    },
  ],
  DAO_DELEGATE_CONTRACT: [
    {
      contractAddress: ['0x92D6C1e31e14520e676a687F0a93788B716BEff5'],
      chain: mainnet,
    },
  ],
  DAO_DELEGATE_ACTION: () =>
    typeof window !== 'undefined' &&
    window.open('https://dydx.vote/delegate', '_blank'),
  DAO_FORUM_TYPE: 'discourse',
  DAO_FORUM_URL: 'https://dydx.forum',
  DAO_GTAG: 'G-67LDHT697P',
  DAO_DEFAULT_SETTINGS: {
    FAQ: true,
    STATUS_FILTER: {
      DEFAULT_STATUS_SELECTED: ['active'],
      CUSTOM_STATUS: ['endorsed', 'active', 'inactive', 'withdrawn'],
    },
    ORDERSTAT: 'karmaScore',
  },
  EXCLUDED_VOTING_HISTORY_COLUMN: [],
  DAO_EXT_VOTES_PROVIDER: {
    onChain: onChainDyDxVotesProvider,
  },
  EXCLUDED_CARD_FIELDS: ['healthScore'],
  ENABLE_DELEGATE_TRACKER: true,
  DAO_CATEGORIES_TYPE: 'workstreams',
  ENABLE_ONCHAIN_REGISTRY: true,
  DELEGATE_REGISTRY_CONTRACT: {
    ADDRESS: '0xd17206EC4D268D0E55bb08A369b6864f1178B81d',
    NETWORK: 10,
  },
  ENABLE_HANDLES_EDIT: ['github'],
};

const dark: IDAOTheme = {
  background: '#141424',
  bodyBg: '#141424',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#6966FF',
  buttonText: '#FFFFFF',
  buttonTextSec: '#FFFFFF',
  headerBg: '#232334',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#FFFFFF', subtext: '#ADB8C0' },
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
    bg: '#232334',
    listBg: '#232334',
    listText: 'white',
    activeBg: '#141424',
  },
  card: {
    icon: '#ADB8C0',
    background: '#232334',
    statBg: 'rgba(102, 102, 102, 0.15)',
    divider: 'rgba(173, 184, 192, 0.2)',
    text: { primary: '#FFFFFF', secondary: '#ADB8C0' },
    border: 'rgba(87, 93, 104, 0.25)',
    common: '#727B81',
    interests: { bg: 'rgba(255, 255, 255, 0.05)', text: '#ADB8C0' },
    workstream: { bg: '#FFFFFF', text: '#222429' },
    socialMedia: '#FFFFFF',
  },
  loginModal: {
    background: '#232334',
    text: '#FFFFFF',
    footer: { bg: 'rgba(102, 102, 102, 0.15)', text: '#FFFFFF' },
    button: {
      bg: '#6966FF',
      text: '#FFFFFF',
    },
  },
  modal: {
    background: '#232334',
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
    header: {
      border: '#ADB8C0',
      title: '#FFFFFF',
      subtitle: '#ADB8C0',
      twitter: '#ADB8C0',
      divider: 'rgba(173, 184, 192, 0.2)',
    },
    buttons: {
      selectBg: '#6966FF',
      selectText: '#FFFFFF',
      navBg: '#34344c',
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
        bg: '#34344c',
      },
      modules: {
        chart: {
          point: '#FFFFFF',
          openGradient: '#5c5c84',
          endGradient: '#34344c',
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
          selectedText: '#232334',
          unSelectedBg: 'transparent',
          unSelectedText: '#ADB8C0',
        },
      },
    },
  },
  tokenHolders: {
    border: '#34383f',
    bg: '#141424',
    stepsColor: '#59D6E0',
    list: {
      text: {
        primary: '#FFFFFF',
        secondary: '#ADB8C0',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#34383f',
      },
    },
    delegations: {
      accordion: {
        button: {
          border: '#FFFFFF',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        },
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#ADB8C0',
        input: {
          placeholder: '#88939F',
          text: '#FFFFFF',
        },
        button: '#FFFFFF',
      },
      border: {
        input: '#88939F',
      },
      input: {
        pillText: '#FFFFFFCC',
        pillBg: '#88939F33',
      },
      card: {
        header: {
          text: '#FFFFFFCC',
          pillText: '#FFFFFFCC',
          pillBg: '#88939F33',
        },
        legend: {
          text: '#F5F5F5',
          bg: '#141424',
          pillText: '#F5F5F5',
          pillBg: '#232334',
        },
        columns: {
          text: '#F5F5F5',
          icon: {
            bg: '#F0EBFA',
            text: '#34383f',
          },
          stats: {
            primary: '#F5F5F5',
            secondary: '#ADB8C0',
            leftBorder: '#59D6E0',
            border: '#DBDFE3',
          },
          voting: {
            total: '#ADB8C0',
            totalNumber: '#88939F',
            proposals: {
              title: '#F5F5F5',
              hyperlink: '#b3a1dd',
              description: '#ADB8C0',
              sort: {
                bg: '#232334',
                border: '#FFFFFF',
                text: '#F5F5F5',
                label: '#ADB8C0',
              },
              vote: {
                iconBg: '#E1F7EA',
                text: '#F5F5F5',
                divider: '#88939F1A',
                reason: {
                  title: '#FFFFFF',
                  text: '#FFFFFF',
                },
              },
              navigation: {
                color: '#FFFFFF',
                buttons: {
                  selectedBg: '#FFFFFF',
                  selectedText: '#080A0E',
                  unSelectedBg: 'transparent',
                  unSelectedText: '#FFFFFF',
                },
              },
            },
            input: {
              placeholder: '#88939F',
              icon: '#4F5D6C',
              border: '#88939F',
              text: '#FFFFFF',
            },
          },
        },
      },
      bg: {
        primary: '#232334',
        secondary: '#1B2030',
        tertiary: '#6966FF',
      },
    },
  },
};

const light: IDAOTheme = {
  background: '#F2F4F9',
  bodyBg: '#F2F4F9',
  title: '#232334',
  subtitle: '#666666',
  text: '#232334',
  branding: '#6966FF',
  buttonText: '#FFFFFF',
  buttonTextSec: '#232334',
  headerBg: '#212328',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#212328', subtext: '#212328', bg: '#FFFFFF' },
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
    bg: '#FFFFFF',
    listBg: '#FFFFFF',
    listText: '#666666',
    activeBg: '#EBEDEF',
    shadow: '0px 0px 4px rgba(0, 0, 0, 0.1)',
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
    logo: 'daos/dydx/logo_black.svg',
    background: '#FFFFFF',
    text: '#212328',
    footer: { bg: '#EBEDEF', text: '#212328' },
    button: {
      bg: '#6966FF',
      text: '#FFFFFF',
    },
  },
  modal: {
    background: '#FFFFFF',
    header: {
      border: '#E6E6E6',
      title: '#212328',
      subtitle: '#666666',
      twitter: '#666666',
      divider: 'rgba(102, 102, 102, 0.2)',
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
          bg: '#6966FF',
          text: '#FFFFFF',
        },
        alternative: {
          bg: 'transparent',
          text: '#212328',
          border: '#595A5E',
        },
      },
    },
    buttons: {
      selectBg: '#6966FF',
      selectText: '#FFFFFF',
      navBg: '#F2F4F9',
      navText: '#212328',
      navUnselectedText: '#666666',
      navBorder: '#212328',
    },
    statement: {
      headline: '#212328',
      text: '#666666',
      sidebar: {
        section: '#212328',
        subsection: '#212328',
        text: '#666666',
        item: {
          bg: 'transparent',
          text: '#212328',
          border: '#666666',
        },
      },
    },
    votingHistory: {
      headline: '#212328',
      divider: '#E6E6E6',
      proposal: {
        title: '#212328',
        type: '#666666',
        date: '#666666',
        result: '#212328',
        verticalDivider: 'rgba(102, 102, 102, 0.5)',
        divider: 'rgba(102, 102, 102, 0.2)',
        bg: '#F2F4F9',
      },
      modules: {
        chart: {
          point: '#181e2b',
          openGradient: '#090B10',
          endGradient: '#F2F4F9',
        },
      },
      reason: {
        title: '#212328',
        text: '#666666',
        divider: 'rgba(102, 102, 102, 0.2)',
      },
      navigation: {
        color: '#666666',
        buttons: {
          selectedBg: '#212328',
          selectedText: '#FFFFFF',
          unSelectedBg: 'transparent',
          unSelectedText: '#666666',
        },
      },
    },
  },
  tokenHolders: {
    border: '#34383f',
    bg: '#F2F4F9',
    stepsColor: '#34383f',
    list: {
      text: {
        primary: '#FFFFFF',
        secondary: '#78828c',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#34383f',
      },
    },
    delegations: {
      accordion: {
        button: {
          border: '#000000',
          text: '#000000',
          icon: '#000000',
        },
      },
      text: {
        primary: '#000000',
        secondary: '#78828c',

        input: {
          placeholder: '#88939F',
          text: '#080A0E',
        },
        button: '#FFFFFF',
      },
      border: {
        input: '#88939F',
      },
      input: {
        pillText: '#000000CC',
        pillBg: '#88939F33',
      },
      card: {
        header: {
          text: '#000000CC',
          pillText: '#000000CC',
          pillBg: '#88939F33',
        },
        legend: {
          text: '#4F5D6C',
          bg: '#F5F5F5',
          pillText: '#000000CC',
          pillBg: '#88939F33',
        },
        columns: {
          text: '#34383f',
          icon: {
            bg: '#F0EBFA',
            text: '#34383f',
          },
          stats: {
            primary: '#212328',
            secondary: '#4F5D6C',
            leftBorder: '#34383f',
            border: '#DBDFE3',
          },
          voting: {
            total: '#080A0E',
            totalNumber: '#88939F',
            proposals: {
              title: '#080A0E',
              hyperlink: '#4A269B',
              description: '#4F5D6C',
              sort: {
                bg: '#FFFFFF',
                border: '#88939F',
                text: '#88939F',
                label: '#4F5D6C',
              },
              vote: {
                iconBg: '#E1F7EA',
                text: '#4F5D6C',
                divider: '#88939F1A',
                reason: {
                  title: '#080A0E',
                  text: '#080A0E',
                },
              },
              navigation: {
                color: '#222429',
                buttons: {
                  selectedBg: '#222429',
                  selectedText: '#FFFFFF',
                  unSelectedBg: 'transparent',
                  unSelectedText: '#222429',
                },
              },
            },
            input: {
              placeholder: '#88939F',
              icon: '#4F5D6C',
              border: '#88939F',
              text: '#000000',
            },
          },
        },
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#222429',
        tertiary: '#222429',
      },
    },
  },
};

const dao = { dark, light, config, ABI };

export default dao;
