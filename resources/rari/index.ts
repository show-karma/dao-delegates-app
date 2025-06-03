import { IDAOConfig, IDAOTheme } from 'types';
import { onChainRariVotesProvider } from 'utils/rari/onChainRariVotesProvider';
import { rari as rariChain } from 'utils/customChains';
import { mainnet } from 'utils/mainnet/rpc';
import ABI from './ABI.json';

const config: IDAOConfig = {
  DAO: 'Rari',
  DAO_DESCRIPTION: `The Delegates of Rari DAO play a vital role in driving the Rari ecosystem forward through their work in governance.`,
  DAO_SUBDESCRIPTION: `This site will help boost transparency by displaying delegate contribution to indicate their involvement and engagement in the DAO.`,
  DAO_URL: 'https://rari.foundation/',
  GOVERNANCE_FORUM: 'https://forum.rari.foundation',
  DAO_KARMA_ID: 'rarifoundation',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/rari/logo.jpg',
  METATAGS: {
    TITLE: `Delegates of Rari DAO`,
    DESCRIPTION: `Find all the active delegates in Rari DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE_DISCORD: 'https://rari.karmahq.xyz/daos/rari/preview-discord.png',
    IMAGE_TWITTER: 'https://rari.karmahq.xyz/daos/rari/preview-twitter.png',
    FAVICON: '/daos/rari/favicon.jpg',
    URL: `https://rari.karmahq.xyz`,
  },
  DAO_DEFAULT_SETTINGS: {
    FAQ: false,
  },
  DAO_CHAINS: [mainnet, rariChain],
  DAO_TOKEN_CONTRACT: [
    {
      contractAddress: ['0xCf78572A8fE97b2B9a4B9709f6a7D9a863c1b8E0'],
      method: ['balanceOf'],
      chain: rariChain,
    },
    {
      contractAddress: ['0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF'],
      method: ['balanceOf'],
      chain: mainnet,
    },
  ],
  DAO_DELEGATE_CONTRACT: [
    {
      contractAddress: ['0xCf78572A8fE97b2B9a4B9709f6a7D9a863c1b8E0'],
      chain: rariChain,
    },
  ],
  DAO_DELEGATE_FUNCTION: 'delegate',
  DAO_CHECK_DELEGATION_FUNCTION: 'delegates',
  DAO_EXT_VOTES_PROVIDER: {
    onChain: onChainRariVotesProvider,
  },
  DAO_FORUM_TYPE: 'discourse',
  DAO_GTAG: 'G-67LDHT697P',
  DAO_CATEGORIES_TYPE: 'workstreams',
  EXCLUDED_VOTING_HISTORY_COLUMN: ['offChainVoteBreakdown'],
  ENABLE_HANDLES_EDIT: ['github'],
  EXCLUDED_CARD_FIELDS: ['healthScore', 'discordScore', 'offChainVotesPct'],
  CUSTOM_DELEGATION: {
    ENABLE_CUSTOM_DELEGATION: true,
    PRIMARY_DELEGATION_CHAIN: mainnet.id,
    SECONDARY_DELEGATION_CHAIN: rariChain.id,
    MAINNET_CONTRACTS: {
      RARI_TOKEN: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF',
      VE_RARI_TOKEN: '0x096Bd9a7a2e703670088C05035e23c7a9F428496',
    },
  },
};

const dark: IDAOTheme = {
  isLogoRounded: true,
  background: '#0C0C0C',
  bodyBg: '#0C0C0C',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#090909',
  brandingImageColor:
    'linear-gradient(to right, rgb(154, 116, 241), rgb(254, 111, 55) 50%, rgb(255, 248, 122) 100%)',
  buttonText: '#FFFFFF',
  buttonTextSec: '#FFFFFF',
  headerBg: 'black',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: {
    text: '#FFFFFF',
    subtext: '#ADB8C0',
    bg: 'black',
  },
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
    border: 'white',
    title: 'white',
    bg: '#0C0C0C',
    listBg: 'black',
    listText: 'white',
    activeBg: 'rgba(102, 102, 102, 0.15)',
  },
  card: {
    icon: '#ADB8C0',
    background: 'black',
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
    background: '#0C0C0C',
    text: '#FFFFFF',
    footer: { bg: 'black', text: '#FFFFFF' },
    button: {
      bg: 'white',
      text: 'black',
    },
  },
  modal: {
    background: '#0C0C0C',
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
      bg: '#1A1D21',
      userBg: '#1A1D21',
      userShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
      topBg: '#2A2E35',
      text: '#FFFFFF',
      subtext: '#ADB8C0',
      input: {
        placeholder: '#ADB8C0',
        text: '#FFFFFF',
        dirtyBorder: '#FFFFFF',
        border: '#404651',
        error: '#C80925',
        bg: '#1A1D21',
      },
      button: {
        disabled: {
          bg: '#2A2E35',
          text: 'rgba(173, 184, 192, 0.5)',
        },
        normal: {
          bg: '#FFFFFF',
          text: '#34383f',
        },
        alternative: {
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
    bg: '#000001',
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
        button: '#090B10',
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
          bg: '#17181D',
          pillText: '#F5F5F5',
          pillBg: '#1B2030',
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
            leftBorder: '#FFFFFF',
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
                bg: '#000001',
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
        primary: '#090B10',
        secondary: '#1B2030',
        tertiary: '#FFFFFF',
      },
    },
  },
};

const light: IDAOTheme = {
  isLogoRounded: true,
  background: '#F2F4F9',
  bodyBg: '#F2F4F9',
  title: '#222429',
  subtitle: '#666666',
  text: '#222429',
  branding: 'black',
  buttonText: '#FFFFFF',
  buttonTextSec: '#222429',
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
    bg: 'transparent',
    listBg: '#F2F4F9',
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
    background: '#FFFFFF',
    text: '#212328',
    footer: { bg: '#EBEDEF', text: '#212328' },
    button: {
      bg: 'white',
      text: 'black',
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
      selectBg: '#212328',
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
        error: '#C80925',
        bg: '#FFFFFF',
      },
      button: {
        disabled: {
          bg: '#F2F4F9',
          text: 'rgba(89, 90, 94, 0.5)',
        },
        normal: {
          bg: '#212328',
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

const dao = { dark, light, config, ABI };

export default dao;
