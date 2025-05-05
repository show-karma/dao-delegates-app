import { ForumActivityBreakdown } from './forumActivity';

export type DelegateStatsBreakdown = {
  post?: string | null;
  updated?: 'manually';
  validRationale?: boolean;
  voted?: boolean;
  proposalTopic?: string;
  rationale?: string;
  createdAt?: string;
};

export type CompensationStatBreakdown = {
  score: string;
  tn: string;
  rn: string;
  breakdown?: Record<string, DelegateStatsBreakdown>;
};

export type VotingPowerBreakdown = {
  date: number;
  amount: number;
};

export type DelegateInfoStats = {
  votingPowerAverage?: string;
  votingPowerMultiplier?: number;
  bonusPoint: number;
  securityCouncilVotePenalty: string;
  securityPenaltyBreakdown?: string;
  commentingProposal: CompensationStatBreakdown;
  communicatingRationale: CompensationStatBreakdown;
  onChainVoting: CompensationStatBreakdown;
  participationRate: string;
  payment: number;
  snapshotVoting: CompensationStatBreakdown;
  delegateFeedback?: {
    relevance: number;
    depthOfAnalysis: number;
    timing: number;
    clarityAndCommunication: number;
    impactOnDecisionMaking: number;
    presenceMultiplier: number;
    initialScore: number;
    finalScore: number;
    justification: {
      relevance: string;
      depthOfAnalysis: string;
      timing: string;
      clarityAndCommunication: string;
      impactOnDecisionMaking: string;
      presence: string;
    };
    posts: ForumActivityBreakdown[];
  };
  votingPowerBreakdown: VotingPowerBreakdown[];
  totalParticipation: string;
  participationRatePercent: number;
  contributions: number;
  biweeklyCalls: number;
  monthlyCalls: number;
};

export type DelegateStatsFromAPI = {
  id: number;
  publicAddress: string;
  ensName: string;
  discourseHandles: string[];
  discussionThread: string;
  name: string;
  profilePicture: string;
  incentiveOptedIn: boolean;
  votingPower: string;
  stats: DelegateInfoStats;
};

export type DelegateCompensationStats = {
  id: number;
  stats: DelegateInfoStats;
  delegate: {
    name?: string;
    ensName?: string;
    publicAddress: string;
    shouldUse: string;
  };
  votingPower: number;
  incentiveOptedIn: boolean;
  delegateImage: string;
  ranking: number;
  participationRate: string;
  participationRatePercent: number;
  snapshotVoting: CompensationStatBreakdown;
  onChainVoting: CompensationStatBreakdown;
  communicatingRationale: CompensationStatBreakdown;
  commentingProposal: CompensationStatBreakdown;
  delegateFeedback?: {
    score: string;
  };
  bonusPoint: string;
  totalParticipation: string;
  securityCouncilVotePenalty?: string;
  securityPenaltyBreakdown?: string;
  payment: string;
};
