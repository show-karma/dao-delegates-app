/**
 * Interface for weekly metrics data
 */
export interface IWeeklyMetrics {
  startDate: string; // The beginning date of the analytics period
  endDate: string; // The end date of the analytics period
  totalVotingPower: string; // The total amount of voting power available in the DAO
  quorumAmount: string; // The minimum amount of voting power required for a proposal to pass
  activeDelegates: number; // The number of delegates who have been active during the reporting period
  votingPowerUsed: string; // The total amount of voting power that has been used across all proposals
  totalVotes: number; // The total number of votes cast across all proposals
  uniqueVoters: number; // The number of unique addresses that have participated in voting
  activeProposals: number; // The number of proposals that are currently active and open for voting
  vpUsagePercentage: number; // The percentage of total voting power that has been used in voting (0-100%)
}

/**
 * Interface for DAO analytics summary
 */
export interface IDaoSummary {
  totalWeeksAnalyzed: number; // Total number of weeks included in the analysis
  averageVotesPerWeek: number; // Average number of votes cast per week
  averageVotingPowerUsed: string; // Average amount of voting power used per week
  averageActiveDelegates: number; // Average number of active delegates per week
  averageUniqueVoters: number; // Average number of unique voters per week
  averageVpUsagePercentage: number; // Average percentage of voting power used per week
}

/**
 * Interface for the complete DAO analytics data
 */
export interface IDaoStats {
  lastUpdated: string; // Timestamp of when the data was last updated
  circulatingSupply: number; // Total circulating supply of the DAO's token
  weeklyMetrics: IWeeklyMetrics[]; // Array of weekly metrics data
  summary: IDaoSummary; // Summary statistics across all weeks
}

/**
 * Tooltip descriptions for summary fields
 */
export const SUMMARY_TOOLTIPS = {
  totalWeeksAnalyzed: 'Total number of weeks included in the analysis',
  averageVotesPerWeek: 'Average number of votes cast per week',
  averageVotingPowerUsed: 'Average amount of voting power used per week',
  averageActiveDelegates: 'Number of delegates who have been active recently',
  averageUniqueVoters: 'Average number of unique voters per week',
  averageVpUsagePercentage:
    'Average percentage of voting power used per week (0-100%)',
};

/**
 * Tooltip descriptions for weekly metrics fields
 */
export const WEEKLY_METRICS_TOOLTIPS = {
  startDate: 'The beginning date of the analytics period being reported',
  endDate: 'The end date of the analytics period being reported',
  totalVotingPower: 'The total amount of voting power available in the DAO',
  quorumAmount:
    'The minimum amount of voting power required for a proposal to be considered valid and pass',
  activeDelegates:
    'The number of delegates who have been active during the reporting period',
  votingPowerUsed:
    'The total amount of voting power that has been used across all proposals',
  totalVotes: 'The total number of votes cast across all proposals',
  uniqueVoters:
    'The number of unique addresses that have participated in voting',
  activeProposals:
    'The number of proposals that are currently active and open for voting',
  vpUsagePercentage:
    'The percentage of total voting power that has been used in voting (0-100%)',
};
