export interface IDAOData {
  name: string;
  forumTopicURL: string;
  count: number;
  delegateCount30dActivity: number;
  description: string;
  socialLinks: {
    discord: string;
    discordGuildId: string;
    forum: string;
    logoUrl: string;
    snapshot: string;
    tally: string;
    twitter: string;
  };
  logoUrl?: string;
  onChainId: null;
  snapshotIds: string[];
  fullName: string;
  lastUpdatedAt?: string;
}
