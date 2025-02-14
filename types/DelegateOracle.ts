export interface IDelegateOracleScore {
  address: string;
  onChainParticipation: number;
  offChainParticipation: number;
  finalScore: number;
  scoreOnChain: boolean;
  lastUpdated: string;
}

export interface IDelegateOracleResponse {
  delegates: IDelegateOracleScore[];
  lastCalculated: string;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
