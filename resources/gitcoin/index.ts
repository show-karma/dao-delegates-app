import { IDAOConfig, IDAOTheme } from 'types';
import { mainnet } from 'wagmi/chains';
import ABI from './ABI.json';

const config: IDAOConfig = {
  DAO: 'Gitcoin',
  DAO_DESCRIPTION: `The Stewards of Gitcoin DAO play a vital role in driving the Gitcoin
  ecosystem forward through their work in governance.`,
  DAO_SUBDESCRIPTION: `This site helps token holders choose stewards and boost transparency by displaying steward contribution to indicate their involvement in the DAO.`,
  DAO_URL: 'https://gitcoin.co',
  GOVERNANCE_FORUM: 'https://gov.gitcoin.co',
  DAO_KARMA_ID: 'gitcoin',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/gitcoin/logo.svg',
  METATAGS: {
    TITLE: `Stewards of Gitcoin DAO`,
    DESCRIPTION: `Find all the active stewards in Gitcoin DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE_DISCORD:
      'https://delegate.gitcoin.co/daos/gitcoin/preview-discord.png',
    IMAGE_TWITTER:
      'https://delegate.gitcoin.co/daos/gitcoin/preview-twitter.png',
    FAVICON: '/daos/gitcoin/favicon.png',
    URL: `https://gitcoin.karmahq.xyz`,
  },
  DAO_CHAINS: [mainnet],
  DAO_TOKEN_CONTRACT: [
    {
      contractAddress: ['0xde30da39c46104798bb5aa3fe8b9e0e1f348163f'],
      method: ['balanceOf'],
      chain: mainnet,
    },
  ],
  DAO_DELEGATE_CONTRACT: [
    {
      contractAddress: ['0xde30da39c46104798bb5aa3fe8b9e0e1f348163f'],
      chain: mainnet,
    },
  ],
  DAO_FORUM_TYPE: 'discourse',
  DAO_GTAG: 'G-67LDHT697P',
  DAO_DEFAULT_SETTINGS: {
    TIMEPERIOD: '180d',
    ORDERSTAT: 'healthScore',
    STATUS_FILTER: {
      DEFAULT_STATUS_SELECTED: ['active', 'recognized'],
    },
  },
  EXCLUDED_CARD_FIELDS: ['onChainVotesPct', 'discordScore'],
  ENABLE_DELEGATE_TRACKER: true,
  EXCLUDED_VOTING_HISTORY_COLUMN: ['onChainVoteBreakdown'],
  DAO_CATEGORIES_TYPE: 'workstreams',
  ENABLE_ONCHAIN_REGISTRY: true,
  DELEGATE_REGISTRY_CONTRACT: {
    ADDRESS: '0xd17206EC4D268D0E55bb08A369b6864f1178B81d',
    NETWORK: 10,
  },
  ENABLE_HANDLES_EDIT: ['github'],
};

const dark: IDAOTheme = {
  logo: '/daos/gitcoin/logo_white.svg',
  background: '#000000',
  bodyBg: '#000000',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#D3F0ED',
  buttonText: '#0E0333',
  buttonTextSec: '#FFFFFF',
  headerBg: '#111111',
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
    bg: '#111111',
    listBg: '#111111',
    listText: 'white',
    activeBg: 'rgba(102, 102, 102, 0.15)',
  },
  card: {
    icon: '#ADB8C0',
    background: '#2f3640',
    statBg: 'rgba(102, 102, 102, 0.15)',
    divider: 'rgba(173, 184, 192, 0.2)',
    text: { primary: '#FFFFFF', secondary: '#ADB8C0' },
    border: 'rgba(87, 93, 104, 0.25)',
    common: '#727B81',
    interests: { bg: 'rgba(255, 255, 255, 0.05)', text: '#ADB8C0' },
    workstream: { bg: '#FFFFFF', text: '#00433B' },
    socialMedia: '#FFFFFF',
  },
  loginModal: {
    logo: 'daos/gitcoin/logo_white.svg',
    background: '#111111',
    text: '#FFFFFF',
    footer: { bg: 'rgba(102, 102, 102, 0.15)', text: '#FFFFFF' },
    button: {
      bg: '#D3F0ED',
      text: '#0E0333',
    },
  },
  modal: {
    background: '#111111',
    header: {
      border: '#ADB8C0',
      title: '#FFFFFF',
      subtitle: '#ADB8C0',
      twitter: '#ADB8C0',
      divider: 'rgba(173, 184, 192, 0.2)',
    },
    buttons: {
      selectBg: '#D3F0ED',
      selectText: '#FFFFFF',
      navBg: '#000000',
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
          bg: '#FFFFFF',
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
      modules: {
        chart: {
          point: '#B999FF',
          endGradient: '#000000',
          openGradient: '#2f3640',
        },
      },
      proposal: {
        title: '#FFFFFF',
        type: '#ADB8C0',
        date: '#ADB8C0',
        result: '#FFFFFF',
        verticalDivider: 'rgba(173, 184, 192, 0.5)',
        divider: 'rgba(173, 184, 192, 0.2)',
        bg: '#000000',
      },
      reason: {
        title: '#FFFFFF',
        text: '#ADB8C0',
        divider: 'rgba(173, 184, 192, 0.2)',
      },
      navigation: {
        color: '#FFFFFF',
        buttons: {
          selectedBg: '#000000',
          selectedText: '#FFFFFF',
          unSelectedBg: 'transparent',
          unSelectedText: '#FFFFFF',
        },
      },
    },
  },
  tokenHolders: {
    border: '#34383f',
    bg: '#000000',
    stepsColor: '#D3F0ED',
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
        button: '#0E0333',
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
          bg: '#3A295F',
          pillText: '#F5F5F5',
          pillBg: '#000000',
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
            leftBorder: '#D3F0ED',
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
                bg: '#000000',
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
        primary: '#111111',
        secondary: '#1B2030',
        tertiary: '#D3F0ED',
      },
    },
  },
};

const light: IDAOTheme = {
  background: '#FFFFFF',
  bodyBg: '#FFFFFF',
  title: '#00433B',
  subtitle: '#666666',
  text: '#00433B',
  branding: '#D3F0ED',
  stroke: '#C8CCCC',
  buttonText: '#000000',
  buttonTextSec: '#00433B',
  headerBg: '#F5F5F5',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#000000', subtext: '#00433B', bg: '#F5F5F5' },
  hat: {
    text: {
      primary: '#000000',
      secondary: '#ADB8C0',
      madeBy: '#000000',
      lastUpdated: '#595A5E',
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
    background: '#F5F5F5',
    divider: 'rgba(102, 102, 102, 0.5)',
    text: { primary: '#212328', secondary: '#666666' },
    statBg: '#EBEDEF',
    border: 'none',
    shadow: '0px 0px 4px rgba(0, 0, 0, 0.1)',
    common: '#727B81',
    interests: { bg: '#EBEDEF', text: '#2C2E32' },
    workstream: { bg: '#595A5E', text: '#F5F5F5' },
    socialMedia: '#595A5E',
  },
  loginModal: {
    logo: 'daos/gitcoin/logo.svg',
    background: '#FFFFFF',
    text: '#212328',
    footer: { bg: '#EBEDEF', text: '#212328' },
    button: {
      bg: '#D3F0ED',
      text: '#0E0333',
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
          bg: '#D3F0ED',
          text: '#0E0333',
        },
        alternative: {
          bg: 'transparent',
          text: '#212328',
          border: '#595A5E',
        },
      },
    },
    buttons: {
      selectBg: '#D3F0ED',
      selectText: '#000000',
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
    border: '#000000',
    bg: '#FFFFFF',
    stepsColor: '#000000',
    list: {
      text: {
        primary: '#000000',
        secondary: '#ADB8C0',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#000000',
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
        secondary: '#88939F',

        input: {
          placeholder: '#88939F',
          text: '#080A0E',
        },
        button: '#000000',
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
          text: '#000000',
          icon: {
            bg: '#F0EBFA',
            text: '#000000',
          },
          stats: {
            primary: '#000000',
            secondary: '#4F5D6C',
            leftBorder: '#000000',
            border: '#DBDFE3',
          },
          voting: {
            total: '#080A0E',
            totalNumber: '#88939F',
            proposals: {
              title: '#080A0E',
              hyperlink: '#000000',
              description: '#4F5D6C',
              sort: {
                bg: '#FFFFFF',
                border: '#88939F',
                text: '#00433B',
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
                color: '#291555',
                buttons: {
                  selectedBg: '#D3F0ED',
                  selectedText: '#000000',
                  unSelectedBg: 'transparent',
                  unSelectedText: '#000000',
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
        secondary: '#291555',
        tertiary: '#d3f0ed',
      },
    },
  },
};

const dao = { dark, light, config, ABI };

export default dao;
