import { IDAOConfig, IDAOTheme } from 'types';
import { getIdBySnapshotId } from 'utils';
import { mainnet } from 'wagmi/chains';
import DEFAULT_TOA from './default_toa';

const config: IDAOConfig = {
  DAO: 'Starknet',
  DAO_DESCRIPTION: `Starknet delegates play a vital role in decentralizing the upgrade process for Starknet mainnet. Delegates vote to approve protocol upgrades before they go live on mainnet. Read more about delegate responsibilities here.`,
  DAO_SUBDESCRIPTION: `This site helps token holders choose delegates and boost transparency by displaying delegate contribution.`,
  DAO_URL: 'https://starkware.co/starknet',
  GOVERNANCE_FORUM: 'https://community.starknet.io/',
  DAO_KARMA_ID: 'starknet',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/starknet/logo.svg',
  METATAGS: {
    TITLE: `Delegates of Starknet DAO`,
    DESCRIPTION: `Find all the active delegates in Starknet DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE_DISCORD:
      'https://delegate.starknet.io/daos/starknet/preview-discord.png',
    IMAGE_TWITTER:
      'https://delegate.starknet.io/daos/starknet/preview-twitter.png',
    FAVICON: '/daos/starknet/favicon.ico',
    URL: `https://starknet.karmahq.xyz`,
  },
  DAO_DEFAULT_SETTINGS: {
    ORDERSTAT: 'votingWeight',
    SORT: 'delegatedVotes',
    STATUS_FILTER: {
      CUSTOM_STATUS: ['endorsed', 'active', 'inactive', 'withdrawn'],
    },
  },
  DAO_CHAINS: [mainnet],
  DAO_DELEGATE_CONTRACT: [
    {
      contractAddress: ['0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446'],
      chain: mainnet,
    },
  ],
  DAO_DELEGATE_FUNCTION: 'setDelegate',
  DAO_DELEGATE_FUNCTION_ARGS: [getIdBySnapshotId('starknet.eth')],
  DAO_CHECK_DELEGATION_FUNCTION: 'delegation',
  DAO_CHECK_DELEGATION_ARGS: [getIdBySnapshotId('starknet.eth')],
  DAO_TOKEN_CONTRACT: [
    {
      contractAddress: ['0xCa14007Eff0dB1f8135f4C25B34De49AB0d42766'],
      method: ['balanceOf'],
      chain: mainnet,
    },
  ],
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
  EXCLUDED_VOTING_HISTORY_COLUMN: ['onChainVoteBreakdown'],
  ENABLE_DELEGATE_TRACKER: true,
  DAO_SUPPORTS_TOA: true,
  DEFAULT_TOA,
  DAO_CATEGORIES_TYPE: 'workstreams',
  ENABLE_HANDLES_EDIT: ['github'],
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
    border: '#34383f',
    bg: '#1C1C3B',
    stepsColor: '#FFFFFF',
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
          bg: '#2C2E32',
          pillText: '#F5F5F5',
          pillBg: '#1C1D20',
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
            leftBorder: '#2D2E49',
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
                bg: '#1C1C3B',
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
        primary: '#2D2E49',
        secondary: '#1B2030',
        tertiary: '#1C1C3B',
      },
    },
  },
};

const light: IDAOTheme = {
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
    logo: '/daos/starknet/logo_black.svg',
    background: '#FFFFFF',
    text: '#212328',
    footer: { bg: '#EBEDEF', text: '#212328' },
    button: {
      bg: '#28286E',
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
    buttons: {
      selectBg: '#2D2E49',
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
        error: '#EF4444',
        bg: '#FFFFFF',
      },
      button: {
        disabled: {
          bg: '#F2F4F9',
          text: 'rgba(89, 90, 94, 0.5)',
        },
        normal: {
          bg: '#2D2E49',
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

const dao = { dark, light, config };

export default dao;
