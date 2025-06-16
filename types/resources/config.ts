import { IFilterPeriod, IStatusOptions } from 'types/contexts';
// eslint-disable-next-line import/no-extraneous-dependencies
import { writeContract } from '@wagmi/core';
import { IChainRow } from 'types/IChainRow';
import { Hex, IConvictionOption } from 'types/votes';
import { IActiveDelegatedTracks, MoonbeamWSC } from 'utils';
import { Chain } from 'wagmi';
import { IForumType } from './forum';
import { IForDelegates } from './header';
import { IVotingHistoryColumn } from './modal';
import { IStats, IStatsID } from './stats';

type JsonRpcProviderConfig = {
  rpc: (chain: Chain) => {
    http: string;
    webSocket?: string;
  } | null;
};

export type IMedias =
  | 'twitter'
  | 'forum'
  | 'discord'
  | 'website'
  | 'thread'
  | 'github';

export interface IDAOConfig {
  DAO: string;
  DAO_DESCRIPTION: string;
  DAO_SUBDESCRIPTION: string;
  DAO_URL: string;
  GOVERNANCE_FORUM: string;
  DAO_KARMA_ID: string;
  DAO_LOGO: string;
  IMAGE_PREFIX_URL: string;
  METATAGS: {
    TITLE: string;
    DESCRIPTION: string;
    IMAGE_DISCORD?: string;
    IMAGE_TWITTER?: string;
    FAVICON: string;
    URL: string;
  };
  DAO_CHAINS: Chain[];
  DAO_DELEGATE_CONTRACT?: {
    contractAddress: `0x${string}`[];
    chain: Chain;
    ABI?: any[];
    method?: string[];
  }[];
  DAO_DELEGATION_URL?: string;
  DAO_TOKEN_CONTRACT?: {
    contractAddress: `0x${string}`[];
    method: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ABI?: any[];
    chain: Chain;
  }[];
  DAO_DELEGATE_ACTION?: () => void;
  DAO_FORUM_TYPE?: IForumType;
  DAO_FORUM_URL?: string;
  DAO_DELEGATE_FUNCTION_ARGS?: string[];
  DAO_DELEGATE_FUNCTION?: string;
  DAO_CHECK_DELEGATION_FUNCTION?: string;
  DAO_CHECK_DELEGATION_ARGS?: string[];
  DAO_GTAG?: string;
  HEADER_MARGIN?: boolean;
  DAO_DISCORD_CHANNEL?: string;
  GET_ENVOLVED_URL?: string;
  APPLY_AS_DELEGATE_URL?: string;
  DAO_DEFAULT_SETTINGS?: {
    FAQ?: boolean;
    GUIDE?: boolean;
    TIMEPERIOD?: IFilterPeriod;
    ORDERSTAT?: IStats;
    DISABLE_LOGIN?: boolean;
    SORT?: IStatsID;
    STATUS_FILTER?: {
      CUSTOM_STATUS?: IStatusOptions[];
      DEFAULT_STATUS_SELECTED?: IStatusOptions[];
    };
    SORT_ORDER?: string[];
  };
  DAO_RESOURCES?: {
    title: string;
    url: string;
  }[];
  TOS_URL?: string;
  SHOULD_NOT_SHOW?: 'overview' | 'stats' | 'handles';
  DAO_SUPPORTS_TOA?: boolean;
  DAO_SUPPORTS_TOS?: boolean;
  DAO_STATUSES?: string[];
  DAO_CATEGORIES_TYPE: 'workstreams' | 'tracks';
  DEFAULT_TOA?: string;
  SORT_OPTIONS?: IStats[];
  EXCLUDED_CARD_FIELDS: IStats[];
  EXCLUDED_VOTING_HISTORY_COLUMN: IVotingHistoryColumn[];
  ENABLE_DELEGATE_TRACKER?: boolean;
  DELEGATION_ERRORS_DICTIONARY?: {
    [key: string]: string;
  };
  ALLOW_UNDELEGATE?: boolean;
  ALLOW_BULK_DELEGATE?: boolean;
  BULK_DELEGATE_MAXSIZE?: number;
  DISABLE_EMAIL_INPUT?: boolean;
  HIDE_FOR_DELEGATES?: IForDelegates[];
  PROPOSAL_LINK?: {
    onChain?: (proposalId: number | string, version?: string) => string;
    offChain?: (proposalId: number | string, version?: string) => string;
  };
  DELEGATION_CUSTOM_AMOUNT?: boolean;
  DELEGATION_CUSTOM_CONVICTION?: boolean;
  DELEGATION_CONVICTION_OPTIONS?: IConvictionOption[];
  ENABLE_ONCHAIN_REGISTRY?: boolean;
  ENABLE_PROXY_SUPPORT?: boolean;
  DELEGATED_VOTES_BREAKDOWN_BY_TRACKS?: boolean;
  DELEGATED_VOTES_BREAKDOWN_BY_NETWORK?: boolean;
  ENABLE_HANDLES_EDIT?: IMedias[];
  DAO_HAS_COMPENSATION_PROGRAM?: boolean;
  DAO_HAS_ORACLE_PROGRAM?: boolean;
  DAO_HAS_REWARD_PROGRAM?: boolean;
  ECOSYSTEM?: {
    name: string;
    icon: string;
    url: string;
  }[];
  DELEGATE_REGISTRY_CONTRACT?: {
    NETWORK: number;
    ADDRESS: Hex;
  };
  TRACKS_DICTIONARY?: { [key: string]: { emoji: string; description: string } };
  // TODO: type anys
  GET_ACTIVE_DELEGATIONS_ACTION?: (
    address: string,
    daoName: string
  ) => Promise<IActiveDelegatedTracks[]>;
  GET_BALANCE_OVERVIEW_ACTION?: (
    address: Hex
  ) => ReturnType<typeof MoonbeamWSC.prototype.getSubAccount>;
  /**
   * Defines a function to bulk delegate
   * @param payload
   * @param write
   * @returns tx hash
   */
  UNDELEGATE_ACTION?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    write: typeof writeContract
  ) => Promise<`0x${string}`>;
  /**
   * Defines a function to bulk delegate
   * @param payload
   * @param write
   * @returns tx hash
   */
  BULK_DELEGATE_ACTION?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    write: typeof writeContract
  ) => Promise<`0x${string}`>;
  GET_LOCKED_TOKENS_ACTION?: (address: Hex) => Promise<number>;
  /**
   * Defines a custom function to parse the votes with an external proposal provider.
   *
   *_initially used by DyDx_
   * @param votes
   */
  DAO_EXT_VOTES_PROVIDER?: {
    onChain?: (
      daoName: string | string[],
      address: string
    ) => Promise<IChainRow[]>;
    offChain?: (
      daoName: string | string[],
      address: string
    ) => Promise<IChainRow[]>;
  };
  // TODO change it from any
  // Had few issues w/ types, for now we'll leave it as any
  CUSTOM_RPC?: any;

  // Custom delegation configuration for DAOs with multiple delegation systems (like RARI)
  CUSTOM_DELEGATION?: {
    ENABLE_CUSTOM_DELEGATION?: boolean;
    PRIMARY_DELEGATION_CHAIN?: number;
    SECONDARY_DELEGATION_CHAIN?: number;
    MAINNET_CONTRACTS?: {
      RARI_TOKEN?: string;
      VE_RARI_TOKEN?: string;
    };
  };
}
