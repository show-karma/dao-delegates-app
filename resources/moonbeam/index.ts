import { ECOSYSTEMS, RPCS, RPCS_WS } from 'helpers';
import { IDAOConfig, IDAOTheme } from 'types';
import {
  moonbeamActiveDelegatedTracks,
  moonbeamGetLockedTokensAction,
  moonbeamOnChainProvider,
  moonriverConvictionOptions,
  moonriverDelegateErrors,
  moonriverTracksDictionary,
} from 'utils';
import { moonbeamGetBalanceOverview } from 'utils/moonbeam/moonbeamGetBalanceOverview';
import { moonriverDelegateAction } from 'utils/moonbeam/moonriverDelegateAction';
import { moonbeam } from 'utils/moonbeam/network';
import { Hex } from 'viem';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { moonriverUndelegateAction } from '../../utils/moonbeam/moonriverUndelegateAction';
import { polkassemblyProposalUrl } from '../../utils/moonbeam/polkassembly';
import ABI from './ABI.json';
import batchContractAbi from './ABI_BATCH_CONTRACT.json';

const bulkContractAddr = '0x0000000000000000000000000000000000000808';
const delegateContractAddr = '0x0000000000000000000000000000000000000812';

const config: IDAOConfig = {
  DAO: 'Moonbeam',
  DAO_DESCRIPTION: `The Delegates of Moonbeam DAO play a vital role in driving the Moonbeam ecosystem forward through their work in governance.`,
  DAO_SUBDESCRIPTION: `This site will help boost transparency by displaying delegate contribution to indicate their involvement and engagement in the DAO.`,
  DAO_URL: 'https://moonbeam.network/',
  GOVERNANCE_FORUM: 'https://forum.moonbeam.foundation/',
  DAO_KARMA_ID: 'moonbeam',
  IMAGE_PREFIX_URL: 'https://cdn.stamp.fyi/avatar/eth:',
  DAO_LOGO: '/daos/moonbeam/logo.png',
  METATAGS: {
    TITLE: `Delegates of Moonbeam DAO`,
    DESCRIPTION: `Find all the active delegates in Moonbeam DAO along with governance stats across on-chain/off-chain voting, forum and discord.`,
    IMAGE_DISCORD: '/daos/moonbeam/preview-discord.png',
    IMAGE_TWITTER: '/daos/moonbeam/preview-twitter.png',
    FAVICON: '/daos/moonbeam/favicon.png',
    URL: `https://delegate.moonbeam.network/`,
  },
  DAO_DEFAULT_SETTINGS: {
    FAQ: true,
    STATUS_FILTER: {
      CUSTOM_STATUS: ['community', 'active', 'inactive', 'withdrawn'],
    },
  },
  DAO_CHAINS: [moonbeam],
  DAO_TOKEN_CONTRACT: [
    {
      contractAddress: ['0x0000000000000000000000000000000000000802'],
      method: ['balanceOf'],
      chain: moonbeam,
    },
  ],
  DAO_FORUM_TYPE: 'discourse',
  DAO_GTAG: 'G-67LDHT697P',
  // DAO_DELEGATE_CONTRACT: '0x0000000000000000000000000000000000000812',
  EXCLUDED_CARD_FIELDS: ['healthScore', 'discordScore', 'offChainVotesPct'],
  DAO_CATEGORIES_TYPE: 'tracks',
  ALLOW_BULK_DELEGATE: true,
  ALLOW_UNDELEGATE: true,
  UNDELEGATE_ACTION: moonriverUndelegateAction(
    bulkContractAddr,
    delegateContractAddr,
    batchContractAbi
  ),
  BULK_DELEGATE_ACTION: moonriverDelegateAction(
    bulkContractAddr, // Batch contract
    delegateContractAddr, // Delegate contract
    batchContractAbi,
    false
  ),
  GET_ACTIVE_DELEGATIONS_ACTION: moonbeamActiveDelegatedTracks,
  GET_LOCKED_TOKENS_ACTION: moonbeamGetLockedTokensAction,
  GET_BALANCE_OVERVIEW_ACTION: (address: Hex) =>
    moonbeamGetBalanceOverview(address, RPCS_WS.moonbeam),
  DAO_EXT_VOTES_PROVIDER: {
    onChain: moonbeamOnChainProvider,
  },
  DELEGATION_ERRORS_DICTIONARY: moonriverDelegateErrors,
  EXCLUDED_VOTING_HISTORY_COLUMN: ['contrarionIndex', 'offChainVoteBreakdown'],
  ENABLE_DELEGATE_TRACKER: true,
  DISABLE_EMAIL_INPUT: true,
  DAO_SUPPORTS_TOS: true,
  PROPOSAL_LINK: {
    onChain: polkassemblyProposalUrl.moonbeam,
    offChain: (proposalId: string | number) =>
      `https://snapshot.org/#/moonbeam-foundation.eth/proposal/${proposalId}`,
  },
  TOS_URL:
    'https://forum.moonbeam.foundation/t/introducing-delegated-voting-enhancing-governance-on-moonriver-and-moonbeam/843',
  HIDE_FOR_DELEGATES: ['delegator-lookup'],
  DELEGATION_CUSTOM_AMOUNT: true,
  DELEGATION_CUSTOM_CONVICTION: true,
  DELEGATION_CONVICTION_OPTIONS: moonriverConvictionOptions,
  TRACKS_DICTIONARY: moonriverTracksDictionary,
  ENABLE_PROXY_SUPPORT: true,
  ECOSYSTEM: ECOSYSTEMS.moonbeam,
  DELEGATED_VOTES_BREAKDOWN_BY_TRACKS: true,
  CUSTOM_RPC: jsonRpcProvider({
    rpc: () => ({
      http: RPCS.moonbeam,
    }),
  }),
  ENABLE_HANDLES_EDIT: ['github'],
};

const dark: IDAOTheme = {
  background: 'linear-gradient(45deg,#000000 0%,#2B1D3C 100%)',
  bodyBg: 'linear-gradient(45deg,#000000 0%,#2B1D3C 100%)',
  title: '#FFFFFF',
  subtitle: '#a0aec0',
  text: '#FFFFFF',
  branding: '#07D3BA',
  buttonText: '#000000',
  buttonTextSec: '#FFFFFF',
  headerBg: '#000000',
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
    bg: 'transparent',
    listBg: '#1B2030',
    listText: 'white',
    activeBg: 'rgba(102, 102, 102, 0.15)',
  },
  card: {
    icon: '#ADB8C0',
    background: '#000000',
    statBg: 'rgba(102, 102, 102, 0.15)',
    divider: 'rgba(173, 184, 192, 0.2)',
    text: { primary: '#FFFFFF', secondary: '#ADB8C0' },
    border: 'rgba(87, 93, 104, 0.25)',
    common: '#727B81',
    interests: { bg: 'rgba(255, 255, 255, 0.05)', text: '#ADB8C0' },
    workstream: { bg: '#FFFFFF', text: '#222429' },
    socialMedia: '#FFFFFF',
  },
  modal: {
    background: '#000000',
    header: {
      border: '#ADB8C0',
      title: '#FFFFFF',
      subtitle: '#ADB8C0',
      twitter: '#ADB8C0',
      divider: 'rgba(173, 184, 192, 0.2)',
    },
    buttons: {
      selectBg: '#6C1E6D',
      selectText: '#FFFFFF',
      navBg: '#c4136b',
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
        bg: '#c4136b',
      },
      modules: {
        chart: {
          point: '#FFFFFF',
          openGradient: '#c4136b',
          endGradient: '#000000',
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
          selectedText: '#000000',
          unSelectedBg: 'transparent',
          unSelectedText: '#ADB8C0',
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
  },
  loginModal: {
    background: '#000000',
    text: '#FFFFFF',
    footer: { bg: '#FFFFFF', text: '#000000' },
    button: {
      bg: '#c4136b',
      text: '#FFFFFF',
    },
  },
  tokenHolders: {
    border: '#34383f',
    bg: '#1B2030',
    stepsColor: '#2EBAC6',
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
          bg: '#323646',
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
            leftBorder: '#529EBC',
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
        primary: '#000000',
        secondary: '#1B2030',
        tertiary: 'linear-gradient(248.86deg, #B6509E 10.51%, #2EBAC6 93.41%)',
      },
    },
  },
};

const light: IDAOTheme = {
  background: '#F2F4F9',
  bodyBg: '#F2F4F9',
  title: '#000000',
  subtitle: '#666666',
  text: '#000000',
  branding: '#07D3BA',
  buttonText: '#000000',
  buttonTextSec: '#000000',
  headerBg: '#2F1747',
  gradientBall: '#ADB8C0',
  themeIcon: '#ADB8C0',
  collapse: { text: '#676767', subtext: '#2A2C32', bg: '#FFFFFF' },
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
      selectBg: '#07D3BA',
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
          bg: '#07D3BA',
          text: '#000000',
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
  loginModal: {
    background: '#000000',
    text: '#FFFFFF',
    footer: { bg: '#FFFFFF', text: '#000000' },
    button: {
      bg: '#c4136b',
      text: '#FFFFFF',
    },
  },
  tokenHolders: {
    border: '#34383f',
    bg: '#F2F4F9',
    stepsColor: '#212328',
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
