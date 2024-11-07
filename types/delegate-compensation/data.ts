export type DelegateStatsBreakdown = {
  post?: string | null;
  updated?: 'manually';
  validRationale?: boolean;
  voted?: boolean;
  proposalTopic?: string;
  rationale?: string;
};

export type CompensationStatBreakdown = {
  score: string;
  tn: string;
  rn: string;
  breakdown?: Record<string, DelegateStatsBreakdown>;
};

export type DelegateStatsFromAPI = {
  id: number;
  publicAddress: string;
  ensName: string;
  discourseHandle: string;
  discussionThread: string;
  name: string;
  profilePicture: string;
  incentiveOptedIn: boolean;
  votingPower: string;
  stats: {
    bonusPoint: number;
    commentingProposal: CompensationStatBreakdown;
    communicatingRationale: CompensationStatBreakdown;
    onChainVoting: CompensationStatBreakdown;
    participationRate: string;
    payment: number;
    snapshotVoting: CompensationStatBreakdown;
    delegateFeedback?: {
      relevance: number;
      depthAnalyses: number;
      timing: number;
      clarityAndCommunication: number;
      impactOnDecision: number;
      presenceInDiscussions: number;
      score: number;
    };
    totalParticipation: string;
    participationRatePercent: number;
  };
};

export type DelegateCompensationStats = {
  id: number;
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
  payment: string;
};
