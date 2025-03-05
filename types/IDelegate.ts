import { ICustomFields } from './ICustomFields';

export interface IDelegateStats {
  period?: string;
  karmaScore?: number;
  karmaRank?: number;
  forumActivityScore?: number;
  forumLikesReceived?: number;
  forumPostsReadCount?: number;
  proposalsInitiated?: number;
  proposalsDiscussed?: number;
  forumTopicCount?: number;
  forumPostCount?: number;
  offChainVotesPct?: number;
  onChainVotesPct?: number;
  updatedAt?: string;
  createdAt?: string;
  percentile?: number;
  gitcoinHealthScore?: number;
  deworkTasksCompleted?: number;
  deworkPoints?: number;
  proposalsOnSnapshot?: number;
  discordScore?: number;
  proposalsOnAragon?: number;
  aragonVotesPct?: number;
  [key: string]: any;
}

export interface IDelegate {
  address: string;
  ensName?: string;
  githubHandle?: string;
  delegateSince?: string;
  forumActivity: number;
  votingWeight?: number;
  delegatedVotes?: number;
  delegatorCount?: number;
  karmaScore: number;
  discordScore: number;
  gitcoinHealthScore?: number;
  voteParticipation: {
    onChain: number;
    offChain: number;
  };
  twitterHandle?: string;
  discordHandle?: string;
  discordUsername?: string;
  discourseHandles?: string[];
  updatedAt?: string;
  aboutMe?: string;
  realName?: string;
  website?: string;
  profilePicture?: string;
  status: string;
  userCreatedAt?: string;
  discussionThread?: string;
  delegatePitch?: {
    threadId: number;
    customFields: ICustomFields[];
    postId: number;
    updatedAt: string;
  };
  workstreams?: { id: number; name: string; description: string }[];
  tracks?: {
    id: number;
    name: string;
  }[];
  acceptedTOS?: boolean;
  rawStats: IDelegateStats[];
}
