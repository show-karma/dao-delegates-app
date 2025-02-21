import { IDAOConfig, IDAOTheme } from 'types';
import { onChainArbitrumVotesProvider } from 'utils';
import { arbitrum } from 'wagmi/chains';
import ABI from './ABI.json';

const config: IDAOConfig = {
  DAO: 'arbitrum',
  DAO_DESCRIPTION: `The Delegates of Arbitrum DAO play a vital role in driving the Arbitrum ecosystem forward through their work in governance and workstreams.`,
  DAO_SUBDESCRIPTION: `This site will help boost transparency with health cards for each Delegate that display metrics and links on their involvement and engagement in the DAO.`,
  DAO_URL: 'https://arbitrum.io',
  GOVERNANCE_FORUM: 'https://forum.arbitrum.foundation/',
  DAO_KARMA_ID: 'arbitrum',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/arbitrum/logo.svg',
  METATAGS: {
    TITLE: `Delegates of Arbitrum DAO`,
    DESCRIPTION: `Find all the active delegates in Arbitrum DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE_DISCORD:
      'https://arbitrum.karmahq.xyz/daos/arbitrum/preview-discord.png',
    IMAGE_TWITTER:
      'https://arbitrum.karmahq.xyz/daos/arbitrum/preview-twitter.png',
    FAVICON: '/daos/arbitrum/favicon.ico',
    URL: `https://arbitrum.karmahq.xyz`,
  },
  DAO_CHAINS: [arbitrum],
  DAO_DEFAULT_SETTINGS: {
    TIMEPERIOD: '90d',
    ORDERSTAT: 'karmaScore',
  },
  DAO_TOKEN_CONTRACT: [
    {
      contractAddress: ['0x912ce59144191c1204e64559fe8253a0e49e6548'],
      method: ['balanceOf'],
      chain: arbitrum,
    },
  ],
  DAO_DELEGATE_CONTRACT: [
    {
      contractAddress: ['0x912ce59144191c1204e64559fe8253a0e49e6548'],
      chain: arbitrum,
    },
  ],
  DAO_FORUM_TYPE: 'discourse',
  DAO_GTAG: 'G-67LDHT697P',
  DAO_EXT_VOTES_PROVIDER: {
    onChain: onChainArbitrumVotesProvider,
  },
  EXCLUDED_CARD_FIELDS: ['healthScore', 'discordScore'],
  EXCLUDED_VOTING_HISTORY_COLUMN: [],
  ENABLE_DELEGATE_TRACKER: true,
  DAO_HAS_COMPENSATION_PROGRAM: true,
  DAO_HAS_ORACLE_PROGRAM: true,
  DAO_CATEGORIES_TYPE: 'workstreams',
  ENABLE_HANDLES_EDIT: ['github'],
};

const dark: IDAOTheme = {
  background: '#000000',
  bodyBg: '#000000',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#0E88CC',
  buttonText: '#FFFFFF',
  buttonTextSec: '#FFFFFF',
  headerBg: '#1A1C1D',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#FFFFFF', subtext: '#ADB8C0' },
  compensation: {
    bg: '#1A1C1D',
    modal: {
      block: '#34393c',
      emphasis: '#0E88CC',
      emphasisBg: '#1E2833',
      blockText: '#FFFFFF',
      text: '#FFFFFF',
      closeBtn: '#FFFFFF',
      closeBtnBg: '#0E101B',
    },
    card: {
      bg: '#222429',
      text: '#FFFFFF',
      secondaryText: '#ADB8C0',
      success: '#079455',
      error: '#B42318',
      link: '#0E88CC',
      divider: '#EAECF0',
      input: {
        bg: '#1A1C1D',
        text: '#FFFFFF',
      },
      dropdown: {
        bg: '#1A1C1D',
        text: '#FFFFFF',
        border: '#98A2B3',
      },
    },
    icons: {
      snapshot: '#cabf88',
      onchain: '#1E2833',
      delegateFeedback: '#2A2433',
      rationale: '#332620',
      bonusPoint: '#1F2D28',
      participationRate: '#332831',
      finalScore: '#393d3b',
    },
    performanceOverview: {
      header: {
        text: '#EAECF0',
        bg: {
          optedIn: '#DDF9F2',
          greaterThan50kVP: '#E1F1FF',
          averageParticipationRate: '#FFEDFA',
          averageVotingPower: '#FFF3D4',
          scoringSystem: '#FFEDFA',
          discord: '#7839EE',
          card: '#1A1C1D',
        },
      },
    },
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
    border: '#ADB8C033',
    title: 'white',
    bg: '#1A1C1D',
    listBg: '#1A1C1D',
    listText: 'white',
    activeBg: 'rgba(102, 102, 102, 0.15)',
  },
  card: {
    icon: '#ADB8C0',
    background: '#1A1C1D',
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
    background: '#1A1C1D',
    text: '#FFFFFF',
    footer: { bg: 'rgba(102, 102, 102, 0.15)', text: '#FFFFFF' },
    button: {
      bg: '#0E88CC',
      text: '#FFFFFF',
    },
  },
  modal: {
    background: '#1A1C1D',
    header: {
      border: '#ADB8C0',
      title: '#FFFFFF',
      subtitle: '#ADB8C0',
      twitter: '#ADB8C0',
      divider: 'rgba(173, 184, 192, 0.2)',
    },
    buttons: {
      selectBg: '#0E88CC',
      selectText: '#FFFFFF',
      navBg: '#152C4E',
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
      modules: {
        chart: {
          point: '#B999FF',
          openGradient: '#8E6ADC',
          endGradient: '#152C4E',
        },
      },
      proposal: {
        title: '#FFFFFF',
        type: '#ADB8C0',
        date: '#ADB8C0',
        result: '#FFFFFF',
        verticalDivider: 'rgba(173, 184, 192, 0.5)',
        divider: 'rgba(173, 184, 192, 0.2)',
        bg: '#152C4E',
      },
      reason: {
        title: '#FFFFFF',
        text: '#ADB8C0',
        divider: 'rgba(173, 184, 192, 0.2)',
      },
      navigation: {
        color: '#FFFFFF',
        buttons: {
          selectedBg: '#152C4E',
          selectedText: '#FFFFFF',
          unSelectedBg: 'transparent',
          unSelectedText: '#FFFFFF',
        },
      },
    },
  },
  tokenHolders: {
    border: '#34383f',
    bg: '#152C4E',
    stepsColor: '#0E88CC',
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
          pillBg: '#152C4E',
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
            leftBorder: '#0E88CC',
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
                bg: '#152C4E',
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
        primary: '#1A1C1D',
        secondary: '#1B2030',
        tertiary: '#0E88CC',
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
  branding: '#0E88CC',
  buttonText: '#FFFFFF',
  buttonTextSec: '#222429',
  headerBg: '#1A1C1D',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#1A1C1D', subtext: '#222429', bg: '#FFFFFF' },
  compensation: {
    bg: '#F2F4F7',
    modal: {
      block: '#F2F4F7',
      emphasis: '#155EEF',
      emphasisBg: '#F5F8FF',
      blockText: '#344054',
      text: '#1D2939',
      closeBtn: '#FFFFFF',
      closeBtnBg: '#0E101B',
    },
    card: {
      bg: '#FFF',
      text: '#1D2939',
      secondaryText: '#667085',
      success: '#079455',
      error: '#B42318',
      link: '#0E88CC',
      divider: '#EAECF0',
      input: {
        bg: '#F2F4F7',
        text: '#1D2939',
      },
      dropdown: {
        bg: '#FFF',
        text: '#667085',
        border: '#98A2B3',
      },
    },
    icons: {
      snapshot: '#FFF3D4',
      onchain: '#E1F1FF',
      delegateFeedback: '#F4EFFF',
      rationale: '#FFE6D5',
      bonusPoint: '#DDF9F2',
      participationRate: '#FFEDFA',
      finalScore: '#EFFFF5',
    },
    performanceOverview: {
      header: {
        text: '#1D2939',
        bg: {
          optedIn: '#DDF9F2',
          greaterThan50kVP: '#E1F1FF',
          averageParticipationRate: '#FFEDFA',
          averageVotingPower: '#FFF3D4',
          discord: '#7839EE',
          scoringSystem: '#FFEDFA',
          card: '#FFFFFF',
        },
      },
    },
  },
  hat: {
    text: {
      primary: '#FFFFFF',
      secondary: '#ADB8C0',
      madeBy: '#FFFFFF',
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
    background: '#FFFFFF',
    divider: 'rgba(102, 102, 102, 0.5)',
    text: { primary: '#212328', secondary: '#666666' },
    statBg: '#EBEDEF',
    border: 'none',
    shadow: '0px 0px 4px rgba(0, 0, 0, 0.1)',
    common: '#727B81',
    interests: { bg: '#EBEDEF', text: '#2C2E32' },
    workstream: { bg: '#595A5E', text: '#FFFFFF' },
    socialMedia: '#595A5E',
  },
  loginModal: {
    logo: 'daos/arbitrum/logo_black.svg',
    background: '#FFFFFF',
    text: '#212328',
    footer: { bg: '#EBEDEF', text: '#212328' },
    button: {
      bg: '#0E88CC',
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
    buttons: {
      selectBg: '#0E88CC',
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
      topBg: '#F2F4F9',
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
      headline: '#212328',
      divider: '#E6E6E6',
      modules: {
        chart: {
          point: '#B999FF',
          openGradient: '#8E6ADC',
          endGradient: '#F2F4F9',
        },
      },
      proposal: {
        title: '#212328',
        type: '#666666',
        date: '#666666',
        result: '#212328',
        verticalDivider: 'rgba(102, 102, 102, 0.5)',
        divider: 'rgba(102, 102, 102, 0.2)',
        bg: '#F2F4F9',
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
    border: '#1A1C1D',
    bg: '#F2F4F9',
    stepsColor: '#1A1C1D',
    list: {
      text: {
        primary: '#FFFFFF',
        secondary: '#ADB8C0',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#1A1C1D',
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
          text: '#1A1C1D',
          icon: {
            bg: '#F0EBFA',
            text: '#1A1C1D',
          },
          stats: {
            primary: '#4A269B',
            secondary: '#4F5D6C',
            leftBorder: '#1A1C1D',
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
                color: '#152C4E',
                buttons: {
                  selectedBg: '#152C4E',
                  selectedText: '#FFFFFF',
                  unSelectedBg: 'transparent',
                  unSelectedText: '#152C4E',
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
        secondary: '#152C4E',
        tertiary: '#24114F',
      },
    },
  },
};

const dao = { dark, light, config, ABI };

export default dao;
