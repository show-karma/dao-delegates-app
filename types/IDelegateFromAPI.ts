import { ICustomFields } from './ICustomFields';

export interface IDelegateFromAPI {
  daoCount: number;
  daoName: string;
  daos: string;
  delegatedVotes: number;
  delegatorCount: number;
  ensName: string;
  isForumVerified: boolean;
  isNominee: boolean;
  joinDateAt: string;
  discussionThread?: string;
  firstTokenDelegatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pitch: any;
  poap: number;
  publicAddress: string;
  score: number;
  twitterHandle: string;
  discordHandle: string;
  discordUsername?: string;
  discourseHandles: string[];
  userType: string;
  aboutMe?: string;
  realName?: string;
  website?: string;
  profilePicture?: string;
  githubHandle?: string;
  voteWeight?: number;
  status: string;
  userCreatedAt?: string;
  scoreBreakdown: {
    name: string;
    pct: number;
    score: number;
  }[];
  stats: {
    createdAt: string;
    forumActivityScore: number;
    forumLikesReceived: number;
    forumPostCount: number;
    forumPostsReadCount: number;
    forumTopicCount: number;
    gitcoinHealthScore: number;
    karmaRank: number;
    karmaScore: number;
    discordScore: number;
    offChainVotesPct: number;
    onChainVotesPct: number;
    percentile: number;
    period: string;
    proposalsDiscussed: number;
    proposalsInitiated: number;
    updatedAt: string;
    aragonVotesPct: number;
    avgPostLength: number;
    avgPostLikes: number;
    avgTopicPostCount: number;
    customScore: number;
    daoName: number;
    delegatedVotes: number;
    discordMessagesCount: number;
    discordMessagesPercentile: number;
    forumLikesReceivedPercentile: number;
    forumPostCountPercentile: number;
    forumPostsReadCountPercentile: number;
    forumTopicCountPercentile: number;
    proposalsDiscussedPercentile: number;
    proposalsInitiatedPercentile: number;
    proposalsOnAragon: number;
    proposalsOnSnapshot: number;
  }[];
  delegatePitch?: {
    threadId: number;
    customFields: ICustomFields[];
    postId: number;
    updatedAt: string;
  };
  snapshotDelegatedVotes?: number;
  workstreams?: {
    id: number;
    name: string;
    description: string;
  }[];
  acceptedTOS?: boolean;
  tracks?: {
    id: number;
    name: string;
  }[];
}
